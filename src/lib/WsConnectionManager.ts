// WsConnectionManager.ts

import { Emitter } from './Emitter';
import { WsClient } from './WsClient';
import type { ConnectionOptions, ConnectionState, Message } from './types';

export class WsConnectionManager extends Emitter {
  private connections: Map<string, WsClient> = new Map();

  /**
   * Crea y registra una nueva conexión WebSocket, pero no la conecta todavía.
   * @param options Las opciones de configuración para la nueva conexión.
   * @returns La instancia de WsClient creada.
   */
  public createConnection(options: ConnectionOptions): WsClient {
    if (this.connections.has(options.id)) {
      throw new Error(`Ya existe una conexión con el ID '${options.id}'.`);
    }

    const client = new WsClient(options);
    this.connections.set(client.id, client);

    // Escuchar eventos del cliente para "burbujearlos" hacia arriba (hacia el manager)
    // De esta forma, puedes escuchar eventos en el manager para todas las conexiones.
    client.on('statusChange', (state: ConnectionState) => {
      this.emit('connectionStatusChange', state);
    });

    client.on('message', (message: Message) => {
      // Agregamos el ID de la conexión al evento del manager para saber de quién es
      this.emit('message', { connectionId: client.id, message });
    });

    this.emit('connectionCreated', client.getState());

    return client;
  }

  /**
   * Obtiene una conexión por su ID.
   * @param id El ID de la conexión.
   */
  public getConnection(id: string): WsClient | undefined {
    return this.connections.get(id);
  }

  /**
   * Obtiene una lista con todas las conexiones gestionadas.
   */
  public getAllConnections(): WsClient[] {
    return Array.from(this.connections.values());
  }

  /**
   * Conecta una conexión específica por su ID.
   * @param id El ID de la conexión a conectar.
   */
  public connect(id: string): void {
    const client = this.getConnection(id);
    if (client) {
      client.connect();
    } else {
      console.error(`No se encontró la conexión con ID '${id}' para conectar.`);
    }
  }

  /**
   * Desconecta una conexión específica por su ID.
   * @param id El ID de la conexión a desconectar.
   */
  public disconnect(id: string): void {
    const client = this.getConnection(id);
    if (client) {
      client.disconnect();
    } else {
      console.error(`No se encontró la conexión con ID '${id}' para desconectar.`);
    }
  }
  
  /**
   * Conecta todas las conexiones gestionadas.
   */
  public connectAll(): void {
    this.connections.forEach(client => client.connect());
  }

  /**
   * Desconecta todas las conexiones gestionadas.
   */
  public disconnectAll(): void {
    this.connections.forEach(client => client.disconnect());
  }

  /**
   * Elimina una conexión del gestor (la desconecta primero).
   * @param id El ID de la conexión a eliminar.
   */
  public removeConnection(id: string): void {
    const client = this.getConnection(id);
    if (client) {
      client.disconnect();
      this.connections.delete(id);
      this.emit('connectionRemoved', id);
    }
  }

  /**
   * Envía un mensaje a través de una conexión específica.
   * @param id El ID de la conexión.
   * @param data El mensaje a enviar (string u objeto).
   */
  public send(id: string, data: string | object): void {
    const client = this.getConnection(id);
    if (client) {
      client.send(data);
    } else {
      console.error(`No se encontró la conexión con ID '${id}' para enviar mensaje.`);
    }
  }
}