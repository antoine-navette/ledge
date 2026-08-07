import { api } from '../config/api';

export const UserService = {
    me: async () => {
        try {
            return await api.client.GET('/users/me');
        } catch {
            return { data: undefined, error: { code: 'NETWORK_ERROR' as const } };
        }
    },
};
