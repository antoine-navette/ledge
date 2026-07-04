import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { EmailVerificationRepository } from '../../domain/repositories/email-verification.repository.js';
import type { User } from '../../domain/entities/user.js';
import { fail, ok, type Result } from '../../core/result.js';

type VerifyEmailResult = Result<void, 'INVALID_TOKEN' | 'TOKEN_EXPIRED' | 'USER_NOT_FOUND' | 'EMAIL_ALREADY_VERIFIED'>;

export class VerifyEmailUseCase {
    constructor(
        private userRepository: UserRepository,
        private emailVerificationRepository: EmailVerificationRepository,
    ) {}

    execute = async (token: string): Promise<VerifyEmailResult> => {
        const now = new Date();

        const emailVerification = await this.emailVerificationRepository.findByToken(token);
        if (!emailVerification) return fail('INVALID_TOKEN');
        if (emailVerification.expiresAt < now) return fail('TOKEN_EXPIRED');

        const user = await this.userRepository.findById(emailVerification.userId);
        if (!user) return fail('USER_NOT_FOUND');
        if (user.isEmailVerified) return fail('EMAIL_ALREADY_VERIFIED');

        const updated: User = { ...user, isEmailVerified: true, updatedAt: now };
        await this.userRepository.save(updated);
        await this.emailVerificationRepository.delete(emailVerification);

        return ok(undefined);
    };
}
