import Ajv from 'ajv';
import { NormalizedMarketData } from './schema';

const ajv = new Ajv({
  allErrors: true,
  strictTypes: true,
  coerceTypes: 'array'
});

const schema = {
  type: 'object',
  required: ['symbol', 'exchange_timestamp', 'bids', 'asks'],
  properties: {
    symbol: { type: 'string', pattern: '^[A-Z]{3,6}/[A-Z]{3,6}$' },
    exchange_timestamp: { type: 'number', minimum: 1609459200000 },
    system_timestamp: { type: 'number' },
    bids: {
      type: 'array',
      items: {
        type: 'object',
        required: ['price', 'quantity'],
        properties: {
          price: { type: 'number', minimum: 0 },
          quantity: { type: 'number', minimum: 0 }
        }
      }
    },
    asks: { /* same as bids */ }
  }
};

export function validateMarketData(data: NormalizedMarketData): boolean {
  const validate = ajv.compile(schema);
  return validate(data) as boolean;
}