import type { Client } from 'openapi-fetch';
import type { paths } from '../../types.gen';

export class AuthService {
    constructor(private readonly client: Client<paths>) {}

    async register(email: string, password: string) {
        try {
            return await this.client.POST('/auth/register', { body: { email, password } });
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }

    async login(email: string, password: string) {
        try {
            return await this.client.POST('/auth/login', { body: { email, password } });
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }

    async logout() {
        try {
            return await this.client.POST('/auth/logout');
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }
}
