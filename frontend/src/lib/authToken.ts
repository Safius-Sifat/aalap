export function isJwtTokenActive(token: string | null | undefined): boolean {
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
