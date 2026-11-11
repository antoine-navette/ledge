import { api } from '../config/api';

export const EmailVerificationService = {
    create: async () => {
        try {
            return await api.client.POST('/email-verifications');
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },

    deleteByToken: async (token: string) => {
        try {
            return await api.client.POST('/email-verifications/{token}/verify', { params: { path: { token } } });
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },
};
