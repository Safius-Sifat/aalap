import { isJwtTokenActive } from '@/lib/authToken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('access_token')?.value;
    const pathname = req.nextUrl.pathname;
    const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isPublicPath = pathname === '/';
    const isProtectedPath = pathname.startsWith('/chat');
    const hasValidToken = isJwtTokenActive(token);

    if (!hasValidToken && isProtectedPath) {
        const response = NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete('access_token');
        return response;
    }

    if (!hasValidToken && !isAuthPath && !isPublicPath && !isProtectedPath) {
        const response = NextResponse.redirect(new URL('/', req.url));
        response.cookies.delete('access_token');
        return response;
    }

    if (hasValidToken && isAuthPath) {
        return NextResponse.redirect(new URL('/chat', req.url));
    }

    if (hasValidToken && isPublicPath) {
        return NextResponse.redirect(new URL('/chat', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|favicon.ico|api).*)'],
};
