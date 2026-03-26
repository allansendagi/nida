import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { checkRateLimit, getClientIdentifier, rateLimiters } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const clientId = getClientIdentifier(request);

    // Select appropriate rate limit based on route
    let config = rateLimiters.api;
    if (pathname.startsWith('/api/webhooks/')) {
      config = rateLimiters.webhook;
    } else if (pathname.startsWith('/api/admin/')) {
      config = rateLimiters.admin;
    } else if (pathname.startsWith('/api/auth/')) {
      config = rateLimiters.auth;
    }

    const result = checkRateLimit(`${clientId}:${pathname}`, config);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toString(),
            'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful requests
    const response = await updateSession(request);
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetAt.toString());
    return response;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
