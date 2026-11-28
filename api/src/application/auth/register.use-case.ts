import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { PasswordHasher } from '../../domain/ports/password-hasher.js';
import type { IdGenerator } from '../../domain/ports/id-generator.js';
import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import type { TokenHasher } from '../../domain/ports/token-hasher.js';
import { User } from '../../domain/entities/user.js';
import { Session } from '../../domain/entities/session.js';

export class RegisterUseCase {
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

        const [user, userCode] = await User.register(
            this.idGenerator.generate() as User['id'],
            email,
            password,
            this.passwordHasher,
            now,
        );
        if (userCode) return [null, userCode] as const;
        // Checked by the unique index on insert rather than with a lookup beforehand, which two concurrent
        // registrations could both pass
        const createCode = await this.userRepository.create(user);
        if (createCode) return [null, createCode] as const;

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
