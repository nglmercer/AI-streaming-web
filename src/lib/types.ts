import {WsClient} from './WsClient.ts'
// types.ts

/** El estado de una conexión WebSocket */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
/** Representa un mensaje enviado o recibido */
export interface Message {
  id: string; // ID único para el mensaje
  type: 'sent' | 'received';
  data: string | object;
  timestamp: number;
}

/** Opciones para crear una nueva conexión */
export interface ConnectionOptions {
  id: string; // Un ID único y personalizado para que puedas identificar esta conexión
  url: string;
  name?: string; // Un nombre amigable opcional
  // Callbacks de configuración opcionales para una lógica específica de esta conexión
  onOpen?: (client: WsClient) => void;
  onClose?: (client: WsClient) => void;
  onError?: (error: Event, client: WsClient) => void;
  onMessage?: (message: Message, client: WsClient) => void;
}

/** Representa el estado interno de una conexión gestionada */
export interface ConnectionState {
  id: string;
  url: string;
  name?: string;
  status: ConnectionStatus;
}