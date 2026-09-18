import type { PasswordHasher } from '../ports/password-hasher.js';
import { EmailVerification } from './email-verification.js';

export class User {
    private constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly passwordHash: string,
        public readonly isEmailVerified: boolean,
        public readonly emailVerification: EmailVerification | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    // passwordHasher is injected here (instead of being called by the use case beforehand)
    // so validation and hashing always happen in order, atomically, in a single call — a
    // caller has no way to hash an invalid password by forgetting to validate it first.
    static register = async (id: string, email: string, password: string, passwordHasher: PasswordHasher) => {
        const now = new Date();

        const emailResult = User.validateEmail(email);
        if (!emailResult.success) return emailResult;

        const passwordResult = User.validatePassword(password);
        if (!passwordResult.success) return passwordResult;

        const passwordHash = await passwordHasher.hash(password);

        return {
            success: true,
            data: new User(id, email, passwordHash, false, null, now, now),
        } as const;
    };

    requestEmailVerification = (token: string) => {
        const now = new Date();

        if (this.isEmailVerified) return { success: false, code: 'EMAIL_ALREADY_VERIFIED' } as const;

        if (
            this.emailVerification &&
            now.getTime() - this.emailVerification.createdAt.getTime() < EmailVerification.COOLDOWN_DURATION
        ) {
            return { success: false, code: 'ACTIVE_COOLDOWN' } as const;
        }

        return {
            success: true,
            data: new User(
                this.id,
                this.email,
                this.passwordHash,
                this.isEmailVerified,
                EmailVerification.create(token),
                this.createdAt,
                now,
            ),
        } as const;
    };

    // No token argument here, on purpose: whether the caller actually supplied the right
    // token is entirely decided by which repository lookup found this User in the first
    // place (by token, never by id, for this flow) — an entity-level re-check couldn't add
    // real protection anyway, since any caller holding a User can already read the correct
    // value straight off emailVerification.token and hand it right back. That property has
    // to be guarded by the use case's choice of query, not by this method — covered by tests.
    verifyEmail = () => {
        const now = new Date();

        // Should never happen: the use case only ever gets here via a repository lookup by
        // token, which can't succeed without emailVerification being set. If it's null
        // anyway, that's a programmer error, not a legitimate outcome to report as a 4xx —
        // let it throw and surface as a 500, like any other unexpected exception.
        if (!this.emailVerification) {
            throw new Error('User.verifyEmail called without a pending email verification');
        }

        if (this.emailVerification.expiresAt < now) return { success: false, code: 'TOKEN_EXPIRED' } as const;

        return {
            success: true,
            data: new User(this.id, this.email, this.passwordHash, true, null, this.createdAt, now),
        } as const;
    };

    private static validateEmail = (email: string) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { success: false, code: 'INVALID_EMAIL' } as const;
        }

        return { success: true } as const;
    };

    private static validatePassword = (password: string) => {
        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/\d/.test(password) ||
            !/[!@#$%^&*(),.?":{}|<>]/.test(password)
        ) {
            return { success: false, code: 'WEAK_PASSWORD' } as const;
        }

        return { success: true } as const;
    };

    static reconstitute = (
        id: string,
        email: string,
        passwordHash: string,
        isEmailVerified: boolean,
        emailVerification: EmailVerification | null,
        createdAt: Date,
        updatedAt: Date,
    ) => {
        return new User(id, email, passwordHash, isEmailVerified, emailVerification, createdAt, updatedAt);
    };
}
