import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { PasswordHasher } from '../../domain/ports/password-hasher.js';
import type { IdGenerator } from '../../domain/ports/id-generator.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import { User } from '../../domain/entities/user.js';
import { Session } from '../../domain/entities/session.js';

export class RegisterUseCase {
    constructor(
        private userRepository: UserRepository,
        private sessionRepository: SessionRepository,
        private passwordHasher: PasswordHasher,
        private idGenerator: IdGenerator,
        private tokenGenerator: TokenGenerator,
    ) {}

    execute = async (email: string, password: string) => {
        const existing = await this.userRepository.findByEmail(email);
        if (existing) return { success: false, code: 'DUPLICATE_EMAIL' } as const;

        const result = await User.register(this.idGenerator.generate(), email, password, this.passwordHasher);
        if (!result.success) return result;
        const user = result.data;

        await this.userRepository.create(user);

        const session = Session.create(
            this.idGenerator.generate(),
            user.id,
            this.tokenGenerator.generate(Session.TOKEN_LENGTH),
        );
        await this.sessionRepository.create(session);

        return { success: true, data: { ...session, user } } as const;
    };
}
