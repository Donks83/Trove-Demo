import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Only set CSP in development to allow Firebase emulator connections
  if (process.env.NODE_ENV === 'development') {
    const csp = `
      default-src 'self' 'unsafe-inline' 'unsafe-eval';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: blob: 
        https://*.googleapis.com 
        https://*.gstatic.com 
        https://*.firebaseapp.com 
        https://*.firebasestorage.app
        https://*.mapbox.com;
      connect-src 'self' 
        http://localhost:* 
        ws://localhost:* 
        https://*.googleapis.com 
        https://*.mapbox.com 
        https://*.firebase.com 
        https://*.firebaseapp.com 
        wss://*.firebaseapp.com
        https://*.firebasestorage.app;
      frame-src 'self' https://*.firebaseapp.com;
    `.replace(/\s+/g, ' ').trim()

    response.headers.set('Content-Security-Policy', csp)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
