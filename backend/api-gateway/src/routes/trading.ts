import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { institutionalAuth } from '../middleware/auth';

export async function tradingRoutes(app: FastifyInstance) {
  const router = app.withTypeProvider<TypeBoxTypeProvider>();
  
  router.addHook('preHandler', institutionalAuth);
  
  router.post('/execute', {
    schema: {
      body: Type.Object({
        symbol: Type.String({ pattern: '^[A-Z]{3}-[A-Z]{3}$' }),
        quantity: Type.Number({ minimum: 1000 }),
        strategy: Type.Enum({ HFT: 'HFT', ARB: 'ARB' })
      }),
      response: {
        200: Type.Object({
          orderId: Type.String(),
          statusUrl: Type.String()
        })
      }
    }
  }, async (request) => {
    const { orgContext } = request;
    const execution = await request.diContainer.executionEngine.execute({
      ...request.body,
      orgId: orgContext.orgId,
      maxLatency: 50 // 50ms SLO
    });
    
    return {
      orderId: execution.id,
      statusUrl: `/orders/${execution.id}`
    };
  });
}