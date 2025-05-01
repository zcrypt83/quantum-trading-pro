import { FastifyRequest, FastifyReply } from 'fastify';
import { verify } from '@shared/libs/jwt';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '@shared/libs/cache';

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 1000, // 1000 requests
  duration: 1, // per second
  blockDuration: 60, // Block for 1 minute if exceeded
  keyPrefix: 'gateway'
});

export async function institutionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Rate Limiting
    await rateLimiter.consume(request.ip);
    
    // JWT Verification
    const token = request.headers['x-api-token'] as string;
    const { orgId, permissions } = await verify(token);
    
    // Permission Check
    if (!permissions.includes('TRADING_ACCESS')) {
      throw new Error('Insufficient permissions');
    }

    // Context Injection
    request.orgContext = {
      orgId,
      rateLimitTier: 'ENTERPRISE',
      allowedStrategies: ['HFT', 'ARBITRAGE']
    };
    
  } catch (error) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}