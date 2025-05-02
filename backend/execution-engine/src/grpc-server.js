import { Server } from '@grpc/grpc-js';
import { OrderService } from '../proto/execution_grpc_pb';
import { OrderManager } from './order-manager';

const server = new Server();
const orderManager = new OrderManager();

server.addService(OrderService, {
  createOrder: (call, callback) => {
    try {
      const order = orderManager.createOrder(call.request.toObject());
      callback(null, order.toProtobuf());
    } catch (error) {
      callback(error);
    }
  },
  
  streamUpdates: (call) => {
    const listener = (update) => {
      call.write(update.toProtobuf());
    };
    orderManager.on('order-update', listener);
    call.on('cancelled', () => {
      orderManager.off('order-update', listener);
    });
  }
});

server.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), () => {
  server.start();
});
