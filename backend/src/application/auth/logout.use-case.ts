import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { Session } from '../../domain/entities/session.js';

export class LogoutUseCase {
    constructor(private sessionRepository: SessionRepository) {}

    execute = async (session: Session): Promise<void> => {
        await this.sessionRepository.delete(session);
    };
}
