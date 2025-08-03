import "./live2d-handler.ts";
import { emitter } from "@utils/Emitter";
import { type ProvidersMap, AudioQueue } from "@lib/audio/audio_queue";
import { WebSocketAudioProvider } from "@lib/audio/providers";
import type { MessageEvent, RemovedValue } from "../types/ws_model";
import {
  triggerRandomExpression,
  triggerRandomMotion,
} from "./live2d-handler.ts";
import { Subtitles, StateSubs } from "@components/Subtitles/subcore.ts";
import {
  template,
  changeStateIndicator,
  getWS,
  ws_api
} from "./wsInstance.ts";
const wsAudioProvider = new WebSocketAudioProvider();
const providers: ProvidersMap = {
  websocketAudio: { instance: wsAudioProvider, initialized: true },
};
export const audioQueue = new AudioQueue(providers, { mode: "archive" });
export function ModelActions(actions: RemovedValue[]) {
  if (actions && actions.length > 0) {
    console.log("actions", actions);
    actions.forEach((action) => {
      if (action.type === "expression") {
        triggerRandomExpression(action.cleanValue);
      } else if (action.type === "motion") {
        triggerRandomMotion(action.cleanValue);
      }
    });
  }
}
emitter.on(
  "send:text-input",
  (data: { text: string; id: string | string[] }) => {
    const templateData = template(data.text);
    if (!ws_api) return;
    StateSubs("thinking...");
    ws_api.send(templateData);
  }
);
async function initializeConnection() {
  const button_connect = document.getElementById("ws_status");
  ws_api?.connect(); //non return
  if (!button_connect) return;
  button_connect.addEventListener("click", () => {
    ws_api?.connect();
  });
}

document.addEventListener("DOMContentLoaded", initializeConnection);
