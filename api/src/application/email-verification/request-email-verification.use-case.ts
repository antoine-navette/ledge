import { User } from '../../domain/entities/user.js';
import type { EmailSender } from '../../domain/ports/email-sender.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';

export class RequestEmailVerificationUseCase {
    constructor(
        private userRepository: UserRepository,
        private emailSender: EmailSender,
        private tokenGenerator: TokenGenerator,
        private emailFrom: string,
        private webUrl: string,
    ) {}

    // Takes the User rather than its id, like LogoutUseCase takes the Session: isAuthenticated already loaded it
    execute = async (user: User) => {
        const now = new Date();

        const token = this.tokenGenerator.generate(User.EMAIL_VERIFICATION_TOKEN_LENGTH);

        const [updated, code] = user.requestEmailVerification(token, now);
        if (code) return [null, code] as const;

        await this.userRepository.save(updated);

        await this.emailSender.send(
            this.emailFrom,
            updated.email,
            'Please verify your email address',
            `Click here to verify your email address: <a href="${this.webUrl}/verify-email/${token}">verify email</a>. This link will expire in 1 hour.`,
        );

        return [updated, null] as const;
    };
}
