/**
 * In-memory rate limiting for MVP
 * For production, consider using @upstash/ratelimit with Redis
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;

  let entry = rateLimitStore.get(key);

  // If no entry or window has expired, create new entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.limit - entry.count);
  const success = entry.count <= config.limit;

  return {
    success,
    limit: config.limit,
    remaining,
    resetAt: entry.resetAt,
  };
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

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  /** Webhook endpoints: 100 requests per minute */
  webhook: { limit: 100, windowSeconds: 60 },
  /** API endpoints: 60 requests per minute */
  api: { limit: 60, windowSeconds: 60 },
  /** Admin endpoints: 120 requests per minute */
  admin: { limit: 120, windowSeconds: 60 },
  /** Auth endpoints: 10 requests per minute (stricter for auth) */
  auth: { limit: 10, windowSeconds: 60 },
};
