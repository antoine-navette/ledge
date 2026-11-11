import type { SessionRepository } from '../../domain/repositories/session.repository.js';

export class AuthenticateUseCase {
    constructor(private sessionRepository: SessionRepository) {}

    execute = async (token: string) => {
        const now = new Date();

        const session = await this.sessionRepository.findByToken(token);
        if (!session) return [null, 'SESSION_NOT_FOUND'] as const;
        if (session.expiresAt < now) return [null, 'SESSION_EXPIRED'] as const;

        const extended = session.extend(now);
        await this.sessionRepository.save(extended);

        return [extended, null] as const;
    };
}
