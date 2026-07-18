import { api } from '../config/api';

export const TransactionService = {
    create: async (
        month: string,
        name: string,
        value: number,
        type: 'expense' | 'income',
        category?: 'need' | 'want' | 'investment',
    ) => {
        try {
            return await api.client.POST('/transactions', { body: { month, name, value, type, category } });
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },

    readAll: async () => {
        try {
            return await api.client.GET('/transactions');
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },

    read: async (id: string) => {
        try {
            return await api.client.GET('/transactions/{id}', { params: { path: { id } } });
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },

    update: async (
        id: string,
        name: string,
        value: number,
        type: 'expense' | 'income',
        category?: 'need' | 'want' | 'investment',
    ) => {
        try {
            return await api.client.PUT('/transactions/{id}', {
                params: { path: { id } },
                body: { name, value, type, category },
            });
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },

    delete: async (id: string) => {
        try {
            return await api.client.DELETE('/transactions/{id}', { params: { path: { id } } });
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },
};
