import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  const pathname = req.nextUrl.pathname;
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (!token && !isAuthPath) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};
