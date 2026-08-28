import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/devices') || pathname.startsWith('/alerts') || pathname.startsWith('/incidents') || pathname.startsWith('/resources') || pathname.startsWith('/shelters') || pathname.startsWith('/weather') || pathname.startsWith('/news') || pathname.startsWith('/notifications')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/dashboard/:path*', '/devices/:path*', '/alerts/:path*', '/incidents/:path*', '/resources/:path*', '/shelters/:path*', '/weather/:path*', '/news/:path*', '/notifications/:path*'],
};
