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

    read: async (criteria?: { month?: string }) => {
        try {
            return await api.client.GET('/transactions', { params: { query: criteria } });
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },

    readById: async (id: string) => {
        try {
            return await api.client.GET('/transactions/{id}', { params: { path: { id } } });
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },

    updateById: async (
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

    deleteById: async (id: string) => {
        try {
            return await api.client.DELETE('/transactions/{id}', { params: { path: { id } } });
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },
};
