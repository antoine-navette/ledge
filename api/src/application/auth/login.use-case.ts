import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { PasswordHasher } from '../../domain/ports/password-hasher.js';
import type { IdGenerator } from '../../domain/ports/id-generator.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import { Session } from '../../domain/entities/session.js';

export class LoginUseCase {
    constructor(
        private userRepository: UserRepository,
        private sessionRepository: SessionRepository,
        private passwordHasher: PasswordHasher,
        private idGenerator: IdGenerator,
        private tokenGenerator: TokenGenerator,
    ) {}

    execute = async (email: string, password: string) => {
        const user = await this.userRepository.findByEmail(email);
        if (!user) return { success: false, code: 'USER_NOT_FOUND' } as const;

        const isPasswordCorrect = await this.passwordHasher.compare(password, user.passwordHash);
        if (!isPasswordCorrect) return { success: false, code: 'WRONG_PASSWORD' } as const;

        const session = Session.create(
            this.idGenerator.generate(),
            user.id,
            this.tokenGenerator.generate(Session.TOKEN_LENGTH),
        );
        await this.sessionRepository.create(session);

        return { success: true, data: { ...session, user } } as const;
    };
}
