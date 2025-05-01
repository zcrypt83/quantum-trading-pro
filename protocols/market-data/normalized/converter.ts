import { NormalizedMarketData } from './schema';
import { MarketDataParser } from '../binance/parser';

export class NormalizationEngine {
  private parsers = new Map<string, MarketDataParser>();
  private buffer = new CircularBuffer(1000);

  constructor() {
    this.parsers.set('BINANCE', new BinanceParser());
    this.parsers.set('CME', new CMEParser());
  }

  normalize(data: RawData): NormalizedMarketData {
    const parser = this.parsers.get(data.exchange);
    if(!parser) throw new Error('Unsupported exchange');
    
    const parsed = parser.parse(data.raw);
    const normalized = this._convertToCommonFormat(parsed);
    
    this.buffer.push(normalized);
    return normalized;
  }

  private _convertToCommonFormat(data: any): NormalizedMarketData {
    return {
      symbol: data.s,
      exchange_timestamp: data.E,
      system_timestamp: Date.now(),
      bids: data.bids.map(b => ({
        price: b[0],
        quantity: b[1],
        orders: b[2] || 0
      })),
      asks: data.asks.map(a => ({
        price: a[0],
        quantity: a[1],
        orders: a[2] || 0
      })),
      data_type: data.u ? 'DELTA' : 'SNAPSHOT',
      exchange: data.exchange,
      sequence_number: data.u || 0
    };
  }
}