import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { TokenHasher } from '../../domain/ports/token-hasher.js';

export class AuthenticateUseCase {
    constructor(
        private sessionRepository: SessionRepository,
        private userRepository: UserRepository,
        private tokenHasher: TokenHasher,
    ) {}

    execute = async (token: string) => {
        const now = new Date();

        const session = await this.sessionRepository.findByTokenHash(this.tokenHasher.hash(token));
        if (!session) return [null, 'SESSION_NOT_FOUND'] as const;
        if (session.expiresAt < now) return [null, 'SESSION_EXPIRED'] as const;

        const user = await this.userRepository.findById(session.userId);
        if (!user) return [null, 'USER_NOT_FOUND'] as const;

        const extended = session.extend(now);
        await this.sessionRepository.save(extended);

        // The token itself isn't stored, but the cookie is renewed with it
        return [Object.assign(extended, { token, user }), null] as const;
    };
}
