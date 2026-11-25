import type { User } from '../entities/user.js';

export interface UserRepository {
    create: (user: User) => Promise<'EMAIL_ALREADY_IN_USE' | null>;
    findById: (id: User['id']) => Promise<User | null>;
    findByEmail: (email: User['email']) => Promise<User | null>;
    findByEmailVerificationTokenHash: (
        tokenHash: NonNullable<User['emailVerification']>['tokenHash'],
    ) => Promise<User | null>;
    save: (user: User) => Promise<void>;
}
