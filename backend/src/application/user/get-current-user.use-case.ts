import type { UserRepository } from '../../domain/repositories/user.repository.js';

export class GetCurrentUserUseCase {
    constructor(private userRepository: UserRepository) {}

    execute = async (id: string) => {
        const user = await this.userRepository.findById(id);
        if (!user) return { success: false, error: 'USER_NOT_FOUND' } as const;

        return { success: true, data: user } as const;
    };
}
