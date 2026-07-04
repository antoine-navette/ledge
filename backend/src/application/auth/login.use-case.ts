import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { Hasher } from '../../domain/ports/hasher.js';
import type { IdManager } from '../../domain/ports/id-manager.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import type { User } from '../../domain/entities/user.js';
import type { Session } from '../../domain/entities/session.js';
import { fail, ok, type Result } from '../../core/result.js';

type LoginResult = Result<{ user: User; session: Session }, 'USER_NOT_FOUND' | 'INVALID_PASSWORD'>;

export class LoginUseCase {
    private readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

    constructor(
        private userRepository: UserRepository,
        private sessionRepository: SessionRepository,
        private hasher: Hasher,
        private idManager: IdManager,
        private tokenGenerator: TokenGenerator,
    ) {}

    execute = async (email: string, password: string): Promise<LoginResult> => {
        const now = new Date();

        const user = await this.userRepository.findByEmail(email);
        if (!user) return fail('USER_NOT_FOUND');

        const isPasswordValid = await this.hasher.compare(password, user.passwordHash);
        if (!isPasswordValid) return fail('INVALID_PASSWORD');

        const session: Session = {
            id: this.idManager.generate(),
            userId: user.id,
            token: this.tokenGenerator.generate(),
            expiresAt: new Date(now.getTime() + this.SESSION_DURATION),
            createdAt: now,
            updatedAt: now,
        };
        await this.sessionRepository.create(session);

        return ok({ user, session });
    };
}
