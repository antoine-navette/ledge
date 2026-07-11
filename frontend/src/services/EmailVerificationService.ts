import type { Client } from 'openapi-fetch';
import type { paths } from '../../types.gen';

export class EmailVerificationService {
    constructor(private readonly client: Client<paths>) {}

    async create() {
        try {
            return await this.client.POST('/email-verifications');
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }

    async delete(token: string) {
        try {
            return await this.client.DELETE('/email-verifications/{token}', { params: { path: { token } } });
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }
}
