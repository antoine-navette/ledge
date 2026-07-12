import { api } from '../config/api';

export const EmailVerificationService = {
    create: async () => {
        try {
            return await api.client.POST('/email-verifications');
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    },

    delete: async (token: string) => {
        try {
            return await api.client.DELETE('/email-verifications/{token}', { params: { path: { token } } });
        } catch {
            return { error: { code: 'NETWORK_ERROR' as const } };
        }
    },
};
