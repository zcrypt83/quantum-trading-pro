import { EventEmitter } from 'events';
import ReconnectingWebSocket from 'reconnecting-websocket';

export class WebSocketClient extends EventEmitter {
  private socket: ReconnectingWebSocket;
  private subscriptions: Map<string, Function> = new Map();

  constructor(url: string) {
    super();
    this.socket = new ReconnectingWebSocket(url, [], {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
    });

    this.socket.onmessage = (event) => {
      const { channel, data } = JSON.parse(event.data);
      this.subscriptions.get(channel)?.(data);
    };
  }

  subscribe<T>(channel: string, callback: (data: T) => void) {
    this.subscriptions.set(channel, callback);
    this.socket.send(JSON.stringify({ action: 'subscribe', channel }));
  }

  unsubscribe(channel: string) {
    this.subscriptions.delete(channel);
    this.socket.send(JSON.stringify({ action: 'unsubscribe', channel }));
  }
}