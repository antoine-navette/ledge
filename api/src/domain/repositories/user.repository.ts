import type { User } from '../entities/user.js';
import type { EmailVerification } from '../entities/email-verification.js';

export interface UserRepository {
    create: (user: User) => Promise<void>;
    findById: (id: User['id']) => Promise<User | null>;
    findByEmail: (email: User['email']) => Promise<User | null>;
    findByEmailVerificationToken: (token: EmailVerification['token']) => Promise<User | null>;
    save: (user: User) => Promise<void>;
}
