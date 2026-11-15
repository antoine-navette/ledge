import { http } from '../config/http.ts';
import { UserMapper } from '../mappers/UserMapper.ts';

export const me = async () => {
    const response = await http.GET('/users/me').catch(() => null);
    if (!response) return [null, 'NETWORK_ERROR'] as const;
    if (response.error) return [null, response.error.code] as const;

    return [UserMapper.toEntity(response.data), null] as const;
};
