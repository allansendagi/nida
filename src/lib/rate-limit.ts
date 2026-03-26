/**
 * Upstash Redis rate limiting for serverless deployment
 * Works across all Vercel serverless function instances
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client (lazy - only connects when env vars are present)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('Upstash Redis not configured. Rate limiting disabled.');
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// Rate limit configurations
export const rateLimitConfigs = {
  /** Webhook endpoints: 100 requests per minute */
  webhook: { limit: 100, window: '1 m' as const },
  /** API endpoints: 60 requests per minute */
  api: { limit: 60, window: '1 m' as const },
  /** Admin endpoints: 120 requests per minute */
  admin: { limit: 120, window: '1 m' as const },
  /** Auth endpoints: 10 requests per minute (stricter for auth) */
  auth: { limit: 10, window: '1 m' as const },
};

// Create rate limiters for each type
const rateLimiters: Map<string, Ratelimit> = new Map();

function getRateLimiter(type: keyof typeof rateLimitConfigs): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  const cached = rateLimiters.get(type);
  if (cached) return cached;

  const config = rateLimitConfigs[type];
  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    analytics: true,
    prefix: `ratelimit:${type}`,
  });

  rateLimiters.set(type, limiter);
  return limiter;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (e.g., IP address + path)
 * @param type - Type of rate limit to apply
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof rateLimitConfigs
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(type);

  // If Redis not configured, allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: rateLimitConfigs[type].limit,
      remaining: rateLimitConfigs[type].limit,
      reset: Date.now() + 60000,
    };
  }

  try {
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // On Redis error, allow the request but log the error
    console.error('Rate limit check failed:', error);
    return {
      success: true,
      limit: rateLimitConfigs[type].limit,
      remaining: rateLimitConfigs[type].limit,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the list (client IP)
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback - in production this should never happen behind a proxy
  return 'unknown';
}

/**
 * Determine which rate limit type to use based on pathname
 */
export function getRateLimitType(pathname: string): keyof typeof rateLimitConfigs {
  if (pathname.startsWith('/api/webhooks/')) {
    return 'webhook';
  } else if (pathname.startsWith('/api/admin/')) {
    return 'admin';
  } else if (pathname.startsWith('/api/auth/')) {
    return 'auth';
  }
  return 'api';
}
// Build trigger: 1774531372
