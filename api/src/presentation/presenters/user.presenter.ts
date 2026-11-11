import type { User } from '../../domain/entities/user.js';
import type { UserSchema } from '../schemas/user.schema.js';

export const UserPresenter = {
    toSchema: (user: User): UserSchema => ({
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }),
};
