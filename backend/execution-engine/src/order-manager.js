// backend/execution-engine/src/order-manager.js
import { EventEmitter } from 'events';
import { FIXConnector } from './connectors/fix';
import { RiskValidator } from '@shared/risk';

class OrderManager extends EventEmitter {
  constructor() {
    super();
    this.pendingOrders = new Map();
    this.executionVenues = {
      'BINANCE': new FIXConnector('binance.cfg'),
      'CME': new FIXConnector('cme.cfg')
    };
  }

  async createOrder(orderSpec) {
    const validated = await RiskValidator.validate(orderSpec);
    
    const order = {
      ...validated,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'RECEIVED'
    };

    this.pendingOrders.set(order.id, order);
    this.routeOrder(order);
    
    return order;
  }

  routeOrder(order) {
    const venue = this.selectExecutionVenue(order);
    const adapter = this.executionVenues[venue];
    
    try {
      const fixMessage = this.createFIXMessage(order);
      adapter.send(fixMessage);
      
      order.status = 'ROUTED';
      this.emit('order-update', order);
    } catch (error) {
      order.status = 'FAILED';
      this.emit('order-error', { order, error });
    }
  }

  selectExecutionVenue(order) {
    // Algoritmo de Smart Order Router
    return order.strategy === 'HFT' ? 'BINANCE' : 'CME';
  }
}