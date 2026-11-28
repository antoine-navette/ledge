import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { PasswordHasher } from '../../domain/ports/password-hasher.js';
import type { IdGenerator } from '../../domain/ports/id-generator.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import type { TokenHasher } from '../../domain/ports/token-hasher.js';
import { Session } from '../../domain/entities/session.js';

export class LoginUseCase {
    constructor(
        private userRepository: UserRepository,
        private sessionRepository: SessionRepository,
        private passwordHasher: PasswordHasher,
        private idGenerator: IdGenerator,
        private tokenGenerator: TokenGenerator,
        private tokenHasher: TokenHasher,
    ) {}

    execute = async (email: string, password: string) => {
        const now = new Date();

        const user = await this.userRepository.findByEmail(email);
        // Compared even without a user, so that the response time doesn't reveal whether the email is registered
        const isPasswordCorrect = await this.passwordHasher.compare(password, user?.passwordHash ?? null);
        if (!user) return [null, 'USER_NOT_FOUND'] as const;
        if (!isPasswordCorrect) return [null, 'PASSWORD_WRONG'] as const;

        const token = this.tokenGenerator.generate(Session.TOKEN_LENGTH);
        const session = Session.create(
            this.idGenerator.generate() as Session['id'],
            user.id,
            token,
            this.tokenHasher,
            now,
        );
        await this.sessionRepository.create(session);

        return [Object.assign(session, { token, user }), null] as const;
    };
}
