import winston from 'winston';
import { LokiTransport } from 'winston-loki';

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true })
  ),
  transports: [
    new LokiTransport({
      host: process.env.LOKI_URL!,
      labels: { app: 'quantum-trading' },
      json: true,
      format: winston.format((info) => ({
        ...info,
        message: info.message,
        level: info.level,
        labels: {
          service: info.service || 'unknown',
          orgId: info.orgId || 'system'
        }
      }))()
    }),
    new winston.transports.Console({
      format: winston.format.prettyPrint({
        colorize: true,
        depth: 5
      })
    })
  ]
});

export const executionLogger = logger.child({ service: 'execution-engine' });
export const riskLogger = logger.child({ service: 'risk-system' });