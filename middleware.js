/**
 * @file middleware.js
 * @description Source file for middleware.js.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  
  // Basic bot blocking based on missing or highly suspicious User-Agents
  const userAgent = request.headers.get('user-agent') || '';
  if (!userAgent || userAgent.includes('curl') || userAgent.includes('wget') || userAgent.includes('python-requests')) {
    // If it's hitting an API route, block it. 
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Access denied.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Set standard security headers (redundant but good for edge)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// Only run middleware on API routes to avoid blocking static assets unnecessarily
export const config = {
  matcher: '/api/:path*',
};
