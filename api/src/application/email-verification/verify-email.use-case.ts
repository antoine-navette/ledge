import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { TokenHasher } from '../../domain/ports/token-hasher.js';

export class VerifyEmailUseCase {
    constructor(
        private userRepository: UserRepository,
        private tokenHasher: TokenHasher,
    ) {}

    execute = async (token: string) => {
        const now = new Date();

        const user = await this.userRepository.findByEmailVerificationTokenHash(this.tokenHasher.hash(token));
        if (!user) return [null, 'EMAIL_VERIFICATION_NOT_FOUND'] as const;

        const [updated, code] = user.verifyEmail(now);
        if (code) return [null, code] as const;

        await this.userRepository.save(updated);

        return [updated, null] as const;
    };
}
