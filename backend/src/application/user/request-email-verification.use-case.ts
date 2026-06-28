import type { EmailSender } from '../../domain/ports/email-sender.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { TokenManager } from '../../domain/ports/token-manager.js';
import type { CacheStore } from '../../domain/ports/cache-store.js';
import { fail, ok, type Result } from '../../core/result.js';

type RequestEmailVerificationInput = {
    userId: string;
};

type RequestEmailVerificationResult = Result<void, 'USER_NOT_FOUND' | 'EMAIL_ALREADY_VERIFIED' | 'ACTIVE_COOLDOWN'>;

export class RequestEmailVerificationUseCase {
    constructor(
        private userRepository: UserRepository,
        private emailSender: EmailSender,
        private tokenManager: TokenManager,
        private cacheStore: CacheStore,
        private emailFrom: string,
        private webUrl: string,
    ) {}

    execute = async (input: RequestEmailVerificationInput): Promise<RequestEmailVerificationResult> => {
        const user = await this.userRepository.findById(input.userId);
        if (!user) return fail('USER_NOT_FOUND');
        if (user.isEmailVerified) return fail('EMAIL_ALREADY_VERIFIED');

        const activeCooldown = await this.cacheStore.hasEmailVerificationCooldown(user.id);
        if (activeCooldown) return fail('ACTIVE_COOLDOWN');

        const subject = 'Please verify your email address';
        const token = this.tokenManager.signEmailVerification({ userId: user.id });
        const html = `Click here to verify your email address: <a href="${this.webUrl}/verify-email/${token}">verify email</a>. This link will expire in 1 hour.`;
        await this.emailSender.send(this.emailFrom, user.email, subject, html);

        await this.cacheStore.setEmailVerificationCooldown(user.id);

        return ok(undefined);
    };
}
