import type { EmailSender } from '../../domain/ports/email-sender.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import { EmailVerification } from '../../domain/entities/email-verification.js';

export class RequestEmailVerificationUseCase {
    constructor(
        private userRepository: UserRepository,
        private emailSender: EmailSender,
        private tokenGenerator: TokenGenerator,
        private emailFrom: string,
        private webUrl: string,
    ) {}

    execute = async (userId: string) => {
        const user = await this.userRepository.findById(userId);
        if (!user) return { success: false, code: 'USER_NOT_FOUND' } as const;

        const token = this.tokenGenerator.generate(EmailVerification.TOKEN_LENGTH);

        const result = user.requestEmailVerification(token);
        if (!result.success) return result;
        const updated = result.data;

        await this.userRepository.save(updated);

        await this.emailSender.send(
            this.emailFrom,
            updated.email,
            'Please verify your email address',
            `Click here to verify your email address: <a href="${this.webUrl}/verify-email/${token}">verify email</a>. This link will expire in 1 hour.`,
        );

        return { success: true, data: updated } as const;
    };
}
