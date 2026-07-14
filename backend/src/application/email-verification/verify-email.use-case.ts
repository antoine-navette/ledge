import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { EmailVerificationRepository } from '../../domain/repositories/email-verification.repository.js';
import type { User } from '../../domain/entities/user.js';

export class VerifyEmailUseCase {
    constructor(
        private userRepository: UserRepository,
        private emailVerificationRepository: EmailVerificationRepository,
    ) {}

    execute = async (token: string) => {
        const now = new Date();

        const emailVerification = await this.emailVerificationRepository.findByToken(token);
        if (!emailVerification) return { success: false, error: 'EMAIL_VERIFICATION_NOT_FOUND' } as const;
        if (emailVerification.expiresAt < now) return { success: false, error: 'TOKEN_EXPIRED' } as const;

        const user = await this.userRepository.findById(emailVerification.userId);
        if (!user) return { success: false, error: 'USER_NOT_FOUND' } as const;
        if (user.isEmailVerified) return { success: false, error: 'EMAIL_ALREADY_VERIFIED' } as const;

        const updated: User = {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            isEmailVerified: true,
            createdAt: user.createdAt,
            updatedAt: now,
        };
        await this.userRepository.save(updated);

        await this.emailVerificationRepository.delete(emailVerification);

        return { success: true } as const;
    };
}
