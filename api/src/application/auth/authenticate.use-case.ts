import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';

export class AuthenticateUseCase {
    constructor(
        private sessionRepository: SessionRepository,
        private userRepository: UserRepository,
    ) {}

    execute = async (token: string) => {
        const now = new Date();

        const session = await this.sessionRepository.findByToken(token);
        if (!session) return [null, 'SESSION_NOT_FOUND'] as const;
        if (session.expiresAt < now) return [null, 'SESSION_EXPIRED'] as const;

        const user = await this.userRepository.findById(session.userId);
        if (!user) return [null, 'USER_NOT_FOUND'] as const;

        const extended = session.extend(now);
        await this.sessionRepository.save(extended);

        return [Object.assign(extended, { user }), null] as const;
    };
}
