  import './live2d-handler.ts';
import { WsConnectionManager } from '@lib/WsConnectionManager';
import type { ConnectionState, Message } from '@lib/types';
import { emitter } from '@utils/Emitter';
import { type ProvidersMap,AudioQueue } from '@lib/audio/audio_queue';
import { WebSocketAudioProvider } from '@lib/audio/providers';
import type { MessageEvent,RemovedValue } from '../types/ws_model';
import { triggerRandomExpression, triggerRandomMotion } from './live2d-handler.ts';
import { Subtitles } from '@components/Subtitles/subcore.ts';
const wsAudioProvider = new WebSocketAudioProvider();
const providers: ProvidersMap = {
  'websocketAudio': { instance: wsAudioProvider, initialized: true }
};
const audioQueue = new AudioQueue(providers, { mode: 'archive' });
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
// 2.Listeners
wsManager.on('connectionStatusChange', (state: ConnectionState) => {
  console.log(`[MANAGER] Estado de '${state.id}' cambió a: ${state.status}`);
});

wsManager.on('message', (data: { connectionId: string; message: Message }) => {
  console.log(`[MANAGER] Mensaje recibido en '${data.connectionId}':`, data.message.data);
});

wsManager.on('connectionCreated', (state: ConnectionState) => {
    console.log(`[MANAGER] Conexión '${state.name}' (${state.id}) ha sido creada.`);
});

// 3. Crear múltiples conexiones
// Usaremos un servicio de echo público para las pruebas.
const wsserver = "ws://127.0.0.1:12393/client-ws"
// Conexión 1: Echo Básico
const onError = (...args:any) => {
  console.log('CALLBACK:', ...args);
  changeStateIndicator('disconnected')
}
const onConnect = (data: any) => {
    console.log("onConnect",data);
    changeStateIndicator('connected')
}
const onMessages = (data: Message) => {
  if (!data || !data.data) return;
  console.log("data.data",data.data)
  const messageData = data.data;
  const {type} = messageData as MessageEvent;
  if (type === 'audio') {
    if (!messageData.audio) return;
      ModelActions(messageData.payload)
      audioQueue.enqueue(
      messageData.audio,         //base64
      'websocketAudio',         
      {                      
        messageData
      },
      false // `false` para encolar.
    ).then(audioId => {
      console.log(`Audio con ID ${audioId} ha sido encolado/reproducido.`);
    }).catch(error => {
      console.error("Error al encolar el audio desde WebSocket:", error);
    });
  }
  if (type === 'text-input' || type === 'full-text') {
    Subtitles.show({ text: messageData.text });
  }
  if (type === 'ERROR'){
    console.log("ERROR",messageData)
    Subtitles.show({ text: JSON.stringify(messageData), position: Subtitles.POSITIONS.TOP_CENTER });
  }
}
function ModelActions(actions:RemovedValue[]){
  if (actions && actions.length > 0) {
    console.log("actions",actions)
    actions.forEach((action) => {
      if (action.type === 'expression') {
        triggerRandomExpression(action.cleanValue);
      } else if (action.type === 'motion') {
        triggerRandomMotion(action.cleanValue);
      }
    });
  }
}
wsManager.createConnection({
  id: 'ws_api',
  name: 'ai server',
  url: wsserver,
  onOpen: onConnect,
  onMessage: onMessages,
  onClose: onError,
});
//wsManager.connect('ws_api');
const ws_api = wsManager.getConnection('ws_api');
emitter.on('send:text-input', (data: string) => {
  const templateData = template(data);
  if (!ws_api) return;
  StateSubs('thinking...');
  ws_api.send(templateData);
})
export function StateSubs(state:string){
    Subtitles.show({ text: state, position: Subtitles.POSITIONS.TOP_CENTER, duration: 2000 });
}
async function initializeConnection(){
    const button_connect = document.getElementById('ws_status');
    ws_api?.connect();//non return
    if (!button_connect) return;
    button_connect.addEventListener('click', () => {
        ws_api?.connect();
    })
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
document.addEventListener('DOMContentLoaded', initializeConnection);