import type { Client } from 'openapi-fetch';
import type { paths } from '../../types.gen';

export class UserService {
    constructor(private readonly client: Client<paths>) {}

    async me() {
        try {
            return await this.client.GET('/users/me');
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }
}
