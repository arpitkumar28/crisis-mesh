import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function hasValidAccessToken(token?: string) {
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(
      Buffer.from(padded, 'base64').toString('utf8'),
    );

    if (typeof payload.exp !== 'number') return true;
    return Date.now() / 1000 < payload.exp;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isAuthenticated = hasValidAccessToken(token);
  const { pathname } = request.nextUrl;

  if (token && !isAuthenticated) {
    const response = NextResponse.next();
    response.cookies.delete('access_token');
    return pathname === '/login' || pathname === '/register'
      ? response
      : NextResponse.redirect(new URL('/login', request.url));
  }

  // Public routes
  if (pathname === '/login' || pathname === '/register') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/devices') ||
    pathname.startsWith('/alerts') ||
    pathname.startsWith('/incidents') ||
    pathname.startsWith('/resources') ||
    pathname.startsWith('/shelters') ||
    pathname.startsWith('/weather') ||
    pathname.startsWith('/news') ||
    pathname.startsWith('/notifications')
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/dashboard/:path*', '/devices/:path*', '/alerts/:path*', '/incidents/:path*', '/resources/:path*', '/shelters/:path*', '/weather/:path*', '/news/:path*', '/notifications/:path*'],
};
