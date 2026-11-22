import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { PasswordHasher } from '../../domain/ports/password-hasher.js';
import type { IdGenerator } from '../../domain/ports/id-generator.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import { Session, type SessionId } from '../../domain/entities/session.js';

export class LoginUseCase {
    constructor(
        private userRepository: UserRepository,
        private sessionRepository: SessionRepository,
        private passwordHasher: PasswordHasher,
        private idGenerator: IdGenerator,
        private tokenGenerator: TokenGenerator,
    ) {}

    execute = async (email: string, password: string) => {
        const now = new Date();

        const user = await this.userRepository.findByEmail(email);
        if (!user) return [null, 'USER_NOT_FOUND'] as const;

        const isPasswordCorrect = await this.passwordHasher.compare(password, user.passwordHash);
        if (!isPasswordCorrect) return [null, 'PASSWORD_WRONG'] as const;

        const session = Session.create(
            this.idGenerator.generate() as SessionId,
            user.id,
            this.tokenGenerator.generate(Session.TOKEN_LENGTH),
            now,
        );
        await this.sessionRepository.create(session);

        return [Object.assign(session, { user }), null] as const;
    };
}
