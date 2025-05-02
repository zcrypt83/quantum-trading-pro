import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';

const server = Fastify({
  logger: {
    level: 'info',
    serializers: {
      req: req => ({
        method: req.method,
        url: req.url,
        hostname: req.hostname
      })
    }
  },
  disableRequestLogging: process.env.NODE_ENV === 'production'
});

// Registro de plugins
server.register(jwt, {
  secret: process.env.JWT_SECRET,
  trusted: validateToken
});

server.register(swagger, {
  routePrefix: '/docs',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'Quantum Trading API',
      version: '3.1.0'
    },
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    }
  }
});

// Middleware institucional
server.addHook('onRequest', async (request) => {
  request.marketData = await cache.get(request.headers['x-instrument-id']);
});

// Endpoint de ejecución
server.post('/execute', {
  schema: {
    body: {
      type: 'object',
      required: ['strategy', 'instrument', 'amount'],
      properties: {
        strategy: { type: 'string', enum: ['HFT', 'ARBITRAGE'] },
        instrument: { type: 'string', pattern: '^[A-Z]{3}-[A-Z]{3}$' },
        amount: { type: 'number', minimum: 100000 }
      }
    }
  }
}, async (request) => {
  const order = await executionEngine.createOrder(request.body);
  return { status: 'PENDING_EXECUTION', orderId: order.id };
});
