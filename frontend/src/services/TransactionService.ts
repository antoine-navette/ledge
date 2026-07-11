import type { Client } from 'openapi-fetch';
import type { paths } from '../../types.gen';

export class TransactionService {
    constructor(private readonly client: Client<paths>) {}

    async create(
        month: string,
        name: string,
        value: number,
        type: 'expense' | 'income',
        expenseCategory?: 'need' | 'want' | 'investment',
    ) {
        try {
            return await this.client.POST('/transactions', {
                body: { month, name, value, type, expenseCategory },
            });
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }

    async readAll() {
        try {
            return await this.client.GET('/transactions');
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }

    async read(id: string) {
        try {
            return await this.client.GET('/transactions/{id}', { params: { path: { id } } });
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }

    async update(
        id: string,
        name: string,
        value: number,
        type: 'expense' | 'income',
        expenseCategory?: 'need' | 'want' | 'investment',
    ) {
        try {
            return await this.client.PUT('/transactions/{id}', {
                params: { path: { id } },
                body: { name, value, type, expenseCategory },
            });
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }

    async delete(id: string) {
        try {
            return await this.client.DELETE('/transactions/{id}', { params: { path: { id } } });
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    }
}
