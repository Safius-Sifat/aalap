import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function isTokenValid(token: string | undefined): boolean {
    if (!token) {
        return false;
    }

    try {
        const payloadPart = token.split('.')[1];
        if (!payloadPart) {
            return false;
        }

        const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
        const payload = JSON.parse(atob(padded)) as { exp?: number };

        if (typeof payload.exp !== 'number') {
            return false;
        }

        const nowInSeconds = Math.floor(Date.now() / 1000);
        return payload.exp > nowInSeconds;
    } catch {
        return false;
    }
}

export function middleware(req: NextRequest) {
    const token = req.cookies.get('access_token')?.value;
    const pathname = req.nextUrl.pathname;
    const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register');
    const hasValidToken = isTokenValid(token);

    if (!hasValidToken && !isAuthPath) {
        const response = NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete('access_token');
        return response;
    }

    if (hasValidToken && isAuthPath) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|favicon.ico|api).*)'],
};
