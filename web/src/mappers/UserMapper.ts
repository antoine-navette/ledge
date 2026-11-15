import type { components } from '../../types.gen.ts';
import type { User } from '../entities/User.ts';

export const UserMapper = {
    toEntity: (schema: components['schemas']['User']): User => ({
        id: schema.id,
        email: schema.email,
        isEmailVerified: schema.isEmailVerified,
        createdAt: new Date(schema.createdAt),
        updatedAt: new Date(schema.updatedAt),
    }),
};
