import type { UserRepository } from '../../domain/repositories/user.repository.js';

export class VerifyEmailUseCase {
    constructor(private userRepository: UserRepository) {}

    execute = async (token: string) => {
        const now = new Date();

        const user = await this.userRepository.findByEmailVerificationToken(token);
        if (!user) return [null, 'EMAIL_VERIFICATION_NOT_FOUND'] as const;

        const [updated, code] = user.verifyEmail(now);
        if (code) return [null, code] as const;

        await this.userRepository.save(updated);

        return [updated, null] as const;
    };
}
