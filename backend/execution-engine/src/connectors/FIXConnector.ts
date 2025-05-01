import { Session, Message, Field } from 'quickfix';
import { logger } from '@shared/libs/logging';

export class FIXConnector extends Session {
  private pendingOrders = new Map<string, Promise<any>>();

  constructor(private readonly config: FIXConfig) {
    super();
    this.initialize();
  }

  private initialize() {
    const sessionID = this.createSessionID(
      this.config.SenderCompID,
      this.config.TargetCompID
    );
    
    this.registerApplication(this);
    this.start();
  }

  protected onLogon(sessionID: string) {
    logger.info(`FIX Session Established: ${sessionID}`);
  }

  async sendOrder(order: ExecutionOrder): Promise<ExecutionReport> {
    const msg = new Message();
    msg.getHeader().setField(new Field(35, 'D'));
    msg.setField(new Field(11, order.id));
    msg.setField(new Field(55, order.symbol));
    msg.setField(new Field(54, order.side === 'BUY' ? '1' : '2'));
    msg.setField(new Field(38, order.quantity));
    msg.setField(new Field(40, '2')); // Limit order
    
    return new Promise((resolve, reject) => {
      this.pendingOrders.set(order.id, { resolve, reject });
      this.send(msg);
    });
  }

  protected fromApp(message: Message) {
    const execType = message.getField(150);
    if (execType === 'F') { // Execution Report
      const orderId = message.getField(11);
      const report = this.parseExecutionReport(message);
      this.pendingOrders.get(orderId)?.resolve(report);
    }
  }
}