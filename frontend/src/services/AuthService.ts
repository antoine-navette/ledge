import { api } from '../config/api';

export const AuthService = {
    register: async (email: string, password: string) => {
        try {
            return await api.client.POST('/auth/register', { body: { email, password } });
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },

    login: async (email: string, password: string) => {
        try {
            return await api.client.POST('/auth/login', { body: { email, password } });
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },

    logout: async () => {
        try {
            return await api.client.POST('/auth/logout');
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },
};
