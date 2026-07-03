import type { EmailVerification } from '../entities/email-verification.js';

export interface EmailVerificationRepository {
    create: (emailVerification: EmailVerification) => Promise<void>;
    findByUserId: (userId: string) => Promise<EmailVerification | null>;
    findByToken: (token: string) => Promise<EmailVerification | null>;
    delete: (emailVerification: EmailVerification) => Promise<void>;
}