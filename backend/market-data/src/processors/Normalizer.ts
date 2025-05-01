import { Kafka } from 'kafkajs';
import { MarketData } from '@shared/types';

export class MarketDataProcessor {
  private readonly kafka = new Kafka({
    clientId: 'market-data-processor',
    brokers: [process.env.KAFKA_BROKERS!]
  });

  private readonly producer = this.kafka.producer();
  private readonly consumer = this.kafka.consumer({ groupId: 'normalizer' });

  async process() {
    await this.connect();
    
    await this.consumer.subscribe({ 
      topic: 'raw-market-data',
      fromBeginning: false
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const rawData = JSON.parse(message.value!.toString());
        const normalized = this.normalizeData(rawData);
        
        await this.producer.send({
          topic: 'normalized-market-data',
          messages: [{
            value: JSON.stringify(normalized),
            timestamp: Date.now().toString()
          }]
        });
      }
    });
  }

  private normalizeData(data: any): MarketData {
    return {
      timestamp: new Date(data.E).getTime(),
      symbol: data.s,
      price: parseFloat(data.p),
      volume: parseFloat(data.q),
      exchange: 'BINANCE',
      sequence: data.t,
      isSnapshot: data.u !== undefined
    };
  }
}