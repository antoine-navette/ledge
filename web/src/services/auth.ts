import { http } from '../config/http.ts';
import { UserMapper } from '../mappers/UserMapper.ts';

export const register = async (email: string, password: string) => {
    const response = await http.POST('/auth/register', { body: { email, password } }).catch(() => null);
    if (!response) return [null, 'NETWORK_ERROR'] as const;
    if (response.error) return [null, response.error.code] as const;

    return [UserMapper.toEntity(response.data), null] as const;
};

export const login = async (email: string, password: string) => {
    const response = await http.POST('/auth/login', { body: { email, password } }).catch(() => null);
    if (!response) return [null, 'NETWORK_ERROR'] as const;
    if (response.error) return [null, response.error.code] as const;

    return [UserMapper.toEntity(response.data), null] as const;
};

export const logout = async () => {
    const response = await http.POST('/auth/logout').catch(() => null);
    if (!response) return 'NETWORK_ERROR' as const;
    if (response.error) return response.error.code;

    return null;
};
