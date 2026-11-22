import createClient from 'openapi-fetch';
import type { paths } from '../../types.gen.ts';

// Fail fast instead of letting a request hang on a bad network: services report it as a NETWORK_ERROR
const TIMEOUT = 10_000;

export const http = createClient<paths>({
    baseUrl: '/api',
    fetch: (request) => fetch(request, { signal: AbortSignal.timeout(TIMEOUT) }),
});

let unauthorizedCallback: (() => void) | null = null;

// The session can disappear while the app is open (logged out in another tab, expired, deleted on the server): an
// UNAUTHORIZED code always means it's gone, whatever the route. Registered by the AuthProvider, which logs the user out
export const onUnauthorized = (callback: () => void) => {
    unauthorizedCallback = callback;

    return () => {
        unauthorizedCallback = null;
    };
};

http.use({
    onResponse: async ({ response }) => {
        // The API answers every request with JSON, except 204 No Content: anything else didn't come from it (e.g. a
        // proxy error page while the API is down) and carries no error code, so treat it like an unreachable API and let
        // services report a NETWORK_ERROR
        if (response.status !== 204 && !response.headers.get('content-type')?.includes('application/json')) {
            throw new Error(`Unexpected non-JSON ${response.status} response`);
        }

        // Read from a clone, since openapi-fetch reads the body afterwards. The code is checked rather than the status:
        // a 401 on login means wrong credentials (CREDENTIALS_INVALID), not a lost session
        if (response.status === 401) {
            const body: unknown = await response.clone().json();
            if (typeof body === 'object' && body !== null && 'code' in body && body.code === 'UNAUTHORIZED') {
                unauthorizedCallback?.();
            }
        }
    },
});
