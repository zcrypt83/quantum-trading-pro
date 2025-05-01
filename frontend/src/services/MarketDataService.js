// src/services/MarketDataService.js
class InstitutionalMarketData {
    constructor() {
      this.ws = new WebSocket('wss://api.quantumtrading.pro/market-data/v3');
      this.cache = new Map();
      this.subscriptions = new Set();
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if(data.type === 'depth') {
          this.processOrderBook(data);
        } else if(data.type === 'trade') {
          this.processTrades(data);
        }
      };
    }
  
    subscribe(symbol) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        symbols: [symbol]
      }));
      this.subscriptions.add(symbol);
    }
  
    processOrderBook(data) {
      // Algoritmo de actualización optimizado
      this.cache.set(data.symbol, {
        bids: this.mergeLevels(this.cache.get(data.symbol)?.bids || [], data.bids),
        asks: this.mergeLevels(this.cache.get(data.symbol)?.asks || [], data.asks)
      });
    }
  }