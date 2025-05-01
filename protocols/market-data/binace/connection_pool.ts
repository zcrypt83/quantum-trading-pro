import WebSocket from 'ws';
import { Queue } from 'bull';

export class ConnectionPool {
  private pool: WebSocket[] = [];
  private maintenanceQueue = new Queue('ws-maintenance');

  constructor(
    private size: number,
    private readonly reconnectInterval = 5000
  ) {
    this.initialize();
    this.startMaintenance();
  }

  private async initialize() {
    for (let i = 0; i < this.size; i++) {
      this.pool.push(await this.createConnection());
    }
  }

  private async createConnection(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws');
      
      ws.on('open', () => {
        ws._lastActivity = Date.now();
        resolve(ws);
      });
      
      ws.on('pong', () => ws._lastActivity = Date.now());
      ws.on('error', reject);
    });
  }

  async acquire(): Promise<WebSocket> {
    while (true) {
      const ws = this.pool.find(ws => ws.readyState === WebSocket.OPEN);
      if (ws) return ws;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private startMaintenance() {
    setInterval(() => {
      this.pool.forEach(ws => {
        if (Date.now() - ws._lastActivity > 30000) {
          ws.terminate();
          this.pool.splice(this.pool.indexOf(ws), 1);
          this.createConnection().then(newWs => this.pool.push(newWs));
        }
      });
    }, this.reconnectInterval);
  }
}