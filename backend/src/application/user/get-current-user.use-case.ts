import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { User } from '../../domain/entities/user.js';
import { fail, ok, type Result } from '../../core/result.js';

type GetCurrentUserResult = Result<{ user: User }, 'USER_NOT_FOUND'>;

export class GetCurrentUserUseCase {
    constructor(private userRepository: UserRepository) {}

    execute = async (userId: string): Promise<GetCurrentUserResult> => {
        const user = await this.userRepository.findById(userId);
        if (!user) return fail('USER_NOT_FOUND');

        return ok({ user });
    };
}
