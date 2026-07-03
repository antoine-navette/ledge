import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { Session } from '../../domain/entities/session.js';

type LogoutInput = { session: Session };

export class LogoutUseCase {
    constructor(private sessionRepository: SessionRepository) {}

    execute = async (input: LogoutInput): Promise<void> => {
        await this.sessionRepository.delete(input.session);
    };
}
