import type { EmailSender } from '../../domain/ports/email-sender.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { EmailVerificationRepository } from '../../domain/repositories/email-verification.repository.js';
import type { IdManager } from '../../domain/ports/id-manager.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import type { EmailVerification } from '../../domain/entities/email-verification.js';
import { fail, ok, type Result } from '../../core/result.js';

type RequestEmailVerificationInput = { userId: string };

type RequestEmailVerificationResult = Result<void, 'USER_NOT_FOUND' | 'EMAIL_ALREADY_VERIFIED' | 'ACTIVE_COOLDOWN'>;

export class RequestEmailVerificationUseCase {
    private readonly COOLDOWN_DURATION = 5 * 60 * 1000;
    private readonly TOKEN_DURATION = 60 * 60 * 1000;

    constructor(
        private userRepository: UserRepository,
        private emailVerificationRepository: EmailVerificationRepository,
        private emailSender: EmailSender,
        private idManager: IdManager,
        private tokenGenerator: TokenGenerator,
        private emailFrom: string,
        private webUrl: string,
    ) {}

    execute = async (input: RequestEmailVerificationInput): Promise<RequestEmailVerificationResult> => {
        const now = new Date();

        const user = await this.userRepository.findById(input.userId);
        if (!user) return fail('USER_NOT_FOUND');
        if (user.isEmailVerified) return fail('EMAIL_ALREADY_VERIFIED');

        const existing = await this.emailVerificationRepository.findByUserId(user.id);
        if (existing) {
            if (now.getTime() - existing.createdAt.getTime() < this.COOLDOWN_DURATION) {
                return fail('ACTIVE_COOLDOWN');
            }
            await this.emailVerificationRepository.delete(existing);
        }

        const emailVerification: EmailVerification = {
            id: this.idManager.generate(),
            userId: user.id,
            token: this.tokenGenerator.generate(),
            expiresAt: new Date(now.getTime() + this.TOKEN_DURATION),
            createdAt: now,
        };
        await this.emailVerificationRepository.create(emailVerification);

        const subject = 'Please verify your email address';
        const html = `Click here to verify your email address: <a href="${this.webUrl}/verify-email/${emailVerification.token}">verify email</a>. This link will expire in 1 hour.`;
        await this.emailSender.send(this.emailFrom, user.email, subject, html);

        return ok(undefined);
    };
}
