import type { UserRepository } from '../../domain/repositories/user.repository.js';

export class VerifyEmailUseCase {
    constructor(private userRepository: UserRepository) {}

    execute = async (token: string) => {
        const user = await this.userRepository.findByEmailVerificationToken(token);
        if (!user) return { success: false, code: 'EMAIL_VERIFICATION_NOT_FOUND' } as const;

        const result = user.verifyEmail();
        if (!result.success) return result;
        const updated = result.data;

        await this.userRepository.save(updated);

        return { success: true, data: updated } as const;
    };
}
