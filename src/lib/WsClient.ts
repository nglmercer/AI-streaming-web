// WsClient.ts

import { Emitter } from './Emitter';
import type { ConnectionOptions, ConnectionState, ConnectionStatus, Message } from './types';

export class WsClient extends Emitter {
  public readonly id: string;
  public readonly name?: string;
  public readonly url: string;
  
  private ws: WebSocket | null = null;
  private state: ConnectionState;
  private options: ConnectionOptions;

  constructor(options: ConnectionOptions) {
    super();
    this.id = options.id;
    this.name = options.name;
    this.url = options.url;
    this.options = options;

    this.state = {
      id: this.id,
      url: this.url,
      name: this.name,
      status: 'disconnected',
    };
  }

  public getState(): ConnectionState {
    return { ...this.state };
  }

  public connect(): void {
    if (this.ws) {
      console.warn(`[${this.id}] Ya existe una conexión o se está intentando conectar.`);
      return;
    }

    this.updateStatus('connecting');
    
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.updateStatus('connected');
        // Usar el callback de configuración si existe
        this.options.onOpen?.(this);
      };

      this.ws.onclose = () => {
        this.updateStatus('disconnected');
        this.ws = null;
        // Usar el callback de configuración si existe
        this.options.onClose?.(this);
      };

      this.ws.onerror = (errorEvent) => {
        console.error(`[${this.id}] Error en WebSocket:`, errorEvent);
        this.updateStatus('error');
        // Usar el callback de configuración si existe
        this.options.onError?.(errorEvent, this);
      };

      this.ws.onmessage = (event) => this.handleMessage(event);
    } catch (error) {
      console.error(`[${this.id}] Falló al crear el WebSocket:`, error);
      this.updateStatus('error');
      this.ws = null;
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      // El estado se actualizará a 'disconnected' a través del evento onclose
    }
  }

  public send(data: string | object): void {
    if (this.state.status !== 'connected' || !this.ws) {
      console.error(`[${this.id}] No se puede enviar, la conexión no está activa.`);
      return;
    }

    const messageData = typeof data === 'object' ? JSON.stringify(data) : data;
    this.ws.send(messageData);

    const sentMessage: Message = {
      id: crypto.randomUUID(),
      type: 'sent',
      data,
      timestamp: Date.now(),
    };
    // Emitir el mensaje para que el manager o listeners externos lo capturen
    this.emit('message', sentMessage);
  }

  private updateStatus(status: ConnectionStatus): void {
    this.state.status = status;
    // Emitir el cambio de estado para que el manager lo capture
    this.emit('statusChange', this.getState());
  }

  private handleMessage(event: MessageEvent): void {
    let data: string | object;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      data = event.data;
    }

    const receivedMessage: Message = {
      id: crypto.randomUUID(),
      type: 'received',
      data,
      timestamp: Date.now(),
    };

    // Emitir el mensaje y también llamar al callback de configuración
    this.emit('message', receivedMessage);
    this.options.onMessage?.(receivedMessage, this);
  }
}