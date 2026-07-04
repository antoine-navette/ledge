import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { Session } from '../../domain/entities/session.js';
import { fail, ok, type Result } from '../../core/result.js';

type AuthenticateResult = Result<Session, 'SESSION_NOT_FOUND' | 'SESSION_EXPIRED'>;

export class AuthenticateUseCase {
    constructor(private sessionRepository: SessionRepository) {}

    execute = async (sessionToken: string): Promise<AuthenticateResult> => {
        const session = await this.sessionRepository.findByToken(sessionToken);
        if (!session) return fail('SESSION_NOT_FOUND');
        if (session.expiresAt < new Date()) return fail('SESSION_EXPIRED');

        return ok(session);
    };
}
