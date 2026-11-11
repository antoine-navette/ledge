import type { User } from '../entities/user.js';

export interface UserRepository {
    create: (user: User) => Promise<'DUPLICATE_EMAIL' | null>;
    findById: (id: User['id']) => Promise<User | null>;
    findByEmail: (email: User['email']) => Promise<User | null>;
    findByEmailVerificationToken: (token: NonNullable<User['emailVerification']>['token']) => Promise<User | null>;
    save: (user: User) => Promise<void>;
}
