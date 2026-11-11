import type { UserId } from '../../domain/entities/user.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';

export class GetCurrentUserUseCase {
    constructor(private userRepository: UserRepository) {}

    execute = async (id: UserId) => {
        const user = await this.userRepository.findById(id);
        if (!user) return [null, 'USER_NOT_FOUND'] as const;

        return [user, null] as const;
    };
}
