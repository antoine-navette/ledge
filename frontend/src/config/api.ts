import createClient from 'openapi-fetch';
import type { paths } from '../../types.gen';

export const api = {
    client: createClient<paths>({
        baseUrl: import.meta.env.VITE_API_URL,
        credentials: 'include',
    }),
};
