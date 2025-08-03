import { WsConnectionManager } from '@lib/WsConnectionManager';
import type { ConnectionState, Message } from '@lib/types';
import { audioQueue,ModelActions } from './main';
import { initBackgroundSelect } from '@components/sidebar/configUpdate';
import { Subtitles, StateSubs } from "@components/Subtitles/subcore.ts";
import { configStorage } from "@components/sidebar/listeners/formPersistence";
const wsManager = new WsConnectionManager();
const template = (text: string, type: string = 'text-input'): {
  type: string;
  text: string;
  images: string[];
} => {
  return {
    type,
    text,
    images: []
  }
}
wsManager.on('connectionStatusChange', (state: ConnectionState) => {
  console.log(`[MANAGER] Estado de '${state.id}' cambió a: ${state.status}`);
});

wsManager.on('message', (data: { connectionId: string; message: Message }) => {
  console.log(`[MANAGER] Mensaje recibido en '${data.connectionId}':`, data.message.data);
});

wsManager.on('connectionCreated', (state: ConnectionState) => {
    console.log(`[MANAGER] Conexión '${state.name}' (${state.id}) ha sido creada.`);
});
function getWS(name:string= 'ws_api'){
    return wsManager.getConnection(name);
}
async function changeStateIndicator(text: string) {
    const button_connect = document.getElementById('ws_status') as HTMLButtonElement;
    if (!button_connect || typeof text !== 'string') return;
    
    button_connect.textContent = text;

    const colorMap: { [key: string]: string } = {
        'connected': 'bg-green-600',
        'disconnect': 'bg-red-600',
        'reconnecting': 'bg-blue-600'
    };
    
    const allClassesToRemove = Object.values(colorMap);
    button_connect.classList.remove(...allClassesToRemove);

    const normalizedText = text.toLowerCase();
    const classToAdd = colorMap[normalizedText]; 

    if (classToAdd) {
        button_connect.classList.add(classToAdd);
    } else {
        button_connect.classList.add('bg-gray-400');
    }
}
const wsserver = "ws://127.0.0.1:12393/client-ws";
const onError = (...args: any) => {
  console.log("CALLBACK:", ...args);
  changeStateIndicator("disconnected");
};
const onConnect = (data: any) => {
  console.log("onConnect", data);
  changeStateIndicator("connected");
    ws_api?.send({
    type: 'fetch-backgrounds',
    })
};
const onMessages = async (data: Message) => {
  if (!data || !data.data) return;
  console.log("data.data", data.data);
  const messageData = data.data;
  const { type } = messageData as MessageEvent;
  switch (type) {
    case "audio":
      if (!messageData.audio) return;
      ModelActions(messageData.payload);
      audioQueue
        .enqueue(
          messageData.audio, //base64
          "websocketAudio",
          {
            messageData,
          },    
        false // `false` para encolar.
      )
      .then((audioId) => {
        console.log(`Audio con ID ${audioId} ha sido encolado/reproducido.`);
      })
      .catch((error) => {
        console.error("Error al encolar el audio desde WebSocket:", error);
      });
      break;
    case "text-input":
    case "full-text":
      Subtitles.show({ text: messageData.text });
      break;
    case "ERROR":
      console.log("ERROR", messageData);
      Subtitles.show({
        text: JSON.stringify(messageData),
        position: Subtitles.POSITIONS.TOP_CENTER,
      });
      break;
    case "background-files":
        const alldata = await configStorage.getAll();
        initBackgroundSelect(messageData.files,alldata);
      console.log("background-files", messageData);
      break;
    default:
      console.log("default", messageData);
      break;
  }
};
wsManager.createConnection({
  id: "ws_api",
  name: "ai server",
  url: wsserver,
  onOpen: onConnect,
  onMessage: onMessages,
  onClose: onError,
});
//wsManager.connect('ws_api');
const ws_api = wsManager.getConnection("ws_api");
export {
    wsManager,
    template,
    getWS,
    changeStateIndicator,
    ws_api
}