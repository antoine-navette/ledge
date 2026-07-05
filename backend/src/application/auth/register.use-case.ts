import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { Hasher } from '../../domain/ports/hasher.js';
import type { IdManager } from '../../domain/ports/id-manager.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import type { User } from '../../domain/entities/user.js';
import type { Session } from '../../domain/entities/session.js';

export class RegisterUseCase {
    private readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

    constructor(
        private userRepository: UserRepository,
        private sessionRepository: SessionRepository,
        private hasher: Hasher,
        private idManager: IdManager,
        private tokenGenerator: TokenGenerator,
    ) {}

    execute = async (email: string, password: string) => {
        const now = new Date();

        const existing = await this.userRepository.findByEmail(email);
        if (existing) return { success: false, error: 'DUPLICATE_EMAIL' } as const;

        const user: User = {
            id: this.idManager.generate(),
            email,
            passwordHash: await this.hasher.hash(password),
            isEmailVerified: false,
            createdAt: now,
            updatedAt: now,
        };
        await this.userRepository.create(user);

        const session: Session = {
            id: this.idManager.generate(),
            userId: user.id,
            token: this.tokenGenerator.generate(),
            expiresAt: new Date(now.getTime() + this.SESSION_DURATION),
            createdAt: now,
            updatedAt: now,
        };
        await this.sessionRepository.create(session);

        return { success: true, data: { ...session, user } } as const;
    };
}
