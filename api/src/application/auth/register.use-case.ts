import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { PasswordHasher } from '../../domain/ports/password-hasher.js';
import type { IdGenerator } from '../../domain/ports/id-generator.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import { User, type UserId } from '../../domain/entities/user.js';
import { Session, type SessionId } from '../../domain/entities/session.js';

export class RegisterUseCase {
    constructor(
        private userRepository: UserRepository,
        private sessionRepository: SessionRepository,
        private passwordHasher: PasswordHasher,
        private idGenerator: IdGenerator,
        private tokenGenerator: TokenGenerator,
    ) {}

    execute = async (email: string, password: string) => {
        const now = new Date();

        const existing = await this.userRepository.findByEmail(email);
        if (existing) return { success: false, code: 'DUPLICATE_EMAIL' } as const;

        const result = await User.register(
            this.idGenerator.generate() as UserId,
            email,
            password,
            this.passwordHasher,
            now,
        );
        if (!result.success) return result;
        const user = result.data;

        await this.userRepository.create(user);

        const session = Session.create(
            this.idGenerator.generate() as SessionId,
            user.id,
            this.tokenGenerator.generate(Session.TOKEN_LENGTH),
            now,
        );
        await this.sessionRepository.create(session);

        return { success: true, data: Object.assign(session, { user }) } as const;
    };
}
