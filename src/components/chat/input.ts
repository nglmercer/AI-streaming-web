import { emitter } from "@utils/Emitter";
import { MicrophoneControllerVAD } from "./MicrophoneControllerVAD";
import { transcriptApi } from "@utils/fetch/fetchapi";
import { StateSubs } from "@components/live2d/main";
console.log("emitter", "inited");
function initializeForm() {
  const form = document.querySelector<HTMLFormElement>("#chat-form");
  const sendInput = document.querySelector<HTMLButtonElement>("#sendInput");
  console.log("form", form, "sendInput", sendInput);
  if (!form || !sendInput) return;
  sendInput.addEventListener("click", (e) => {
    sendTextMessage();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendTextMessage();
  });
}
function sendTextMessage() {
  const Input = document.querySelector<HTMLInputElement>(
    "#chat-form #Input_text"
  );
  console.log("Input", Input);
  if (!Input) return;
  console.log(Input.value);
  emitter.emit("send:text-input", Input.value);
  Input.value = "";
}
document.addEventListener("DOMContentLoaded", initializeForm);

const micVad = new MicrophoneControllerVAD();

const micButton = document.getElementById("mic-toggle") as HTMLButtonElement;
micButton.addEventListener("click", () => {
  if (micVad.isRunning) {
    micVad.pause();
  } else {
    micVad.resume();
  }
});

emitter.on("vad:start", () => console.log("Turno de voz iniciado"));
emitter.on(
  "vad:end",
  async (data: { buffer: Float32Array; timestamp: number }) => {
    StateSubs('listening...');
    await transcriptApi
      .transcribe({ type: "float32array", data: data.buffer })
      .then((res) => {
        console.log("res", res);
        emitter.emit("send:text-input", res.transcript);
        StateSubs(res.transcript);
      });
  }
);
