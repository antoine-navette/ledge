import { http } from '../config/http.ts';

export const requestEmailVerification = async () => {
    const response = await http.POST('/email-verifications').catch(() => null);
    if (!response) return 'NETWORK_ERROR' as const;
    if (response.error) return response.error.code;

    return null;
};

export const verifyEmail = async (token: string) => {
    const response = await http
        .POST('/email-verifications/{token}/verify', { params: { path: { token } } })
        .catch(() => null);
    if (!response) return 'NETWORK_ERROR' as const;
    if (response.error) return response.error.code;

    return null;
};
