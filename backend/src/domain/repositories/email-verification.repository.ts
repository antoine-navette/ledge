import type { EmailVerification } from '../entities/email-verification.js';

export interface EmailVerificationRepository {
    create: (emailVerification: EmailVerification) => Promise<void>;
    findByUserId: (userId: EmailVerification['userId']) => Promise<EmailVerification | null>;
    findByToken: (token: EmailVerification['token']) => Promise<EmailVerification | null>;
    delete: (emailVerification: EmailVerification) => Promise<void>;
}
