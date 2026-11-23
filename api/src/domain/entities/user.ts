import type { PasswordHasher } from '../ports/password-hasher.js';
import type { TokenHasher } from '../ports/token-hasher.js';

// Not exported: an email verification only exists through its User, which is the only one able to create or rebuild it
class EmailVerification {
    // Never set at runtime: only makes the class nominal, so a plain object can't be passed off as an EmailVerification
    declare private readonly brand: 'EmailVerification';

    static readonly TOKEN_LENGTH = 64;
    static readonly COOLDOWN_DURATION = 5 * 60 * 1000;
    private static readonly DURATION = 60 * 60 * 1000;

    private constructor(
        // Only the token's hash is stored, like a session's: the token itself only exists in the email's link
        public readonly tokenHash: string,
        public readonly expiresAt: Date,
        public readonly createdAt: Date,
    ) {}

    static create = (token: string, tokenHasher: TokenHasher, now: Date) => {
        // Same reasoning as Session.create(): token length is a security property, not an
        // incidental format detail — a wrong length means the caller's TokenGenerator wiring
        // is broken, a programmer error, not a legitimate outcome to report as a 4xx.
        if (token.length !== EmailVerification.TOKEN_LENGTH) {
            throw new Error(
                `EmailVerification.create called with a token of length ${token.length}, expected ${EmailVerification.TOKEN_LENGTH}`,
            );
        }

        return new EmailVerification(
            tokenHasher.hash(token),
            new Date(now.getTime() + EmailVerification.DURATION),
            now,
        );
    };

    static reconstitute = (tokenHash: string, expiresAt: Date, createdAt: Date) => {
        return new EmailVerification(tokenHash, expiresAt, createdAt);
    };
}

export type UserId = string & { readonly __brand: 'UserId' };

export class User {
    // Never set at runtime: only makes the class nominal, so a plain object can't be passed off as a User without
    // going through its factories
    declare private readonly brand: 'User';

    static readonly EMAIL_VERIFICATION_TOKEN_LENGTH = EmailVerification.TOKEN_LENGTH;

    private constructor(
        public readonly id: UserId,
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
    static register = async (
        id: UserId,
        email: string,
        password: string,
        passwordHasher: PasswordHasher,
        now: Date,
    ) => {
        const emailCode = User.validateEmail(email);
        if (emailCode) return [null, emailCode] as const;

        const passwordCode = User.validatePassword(password);
        if (passwordCode) return [null, passwordCode] as const;

        const passwordHash = await passwordHasher.hash(password);

        return [new User(id, email, passwordHash, false, null, now, now), null] as const;
    };

    requestEmailVerification = (token: string, tokenHasher: TokenHasher, now: Date) => {
        if (this.isEmailVerified) return [null, 'EMAIL_ALREADY_VERIFIED'] as const;

        if (
            this.emailVerification &&
            now.getTime() - this.emailVerification.createdAt.getTime() < EmailVerification.COOLDOWN_DURATION
        ) {
            return [null, 'EMAIL_VERIFICATION_COOLDOWN_ACTIVE'] as const;
        }

        return [
            new User(
                this.id,
                this.email,
                this.passwordHash,
                this.isEmailVerified,
                EmailVerification.create(token, tokenHasher, now),
                this.createdAt,
                now,
            ),
            null,
        ] as const;
    };

    // No token argument here, on purpose: whether the caller supplied the right token is
    // entirely decided by which repository lookup found this User in the first place (by the
    // token's hash, never by id, for this flow). That property has to be guarded by the use
    // case's choice of query, not by this method.
    verifyEmail = (now: Date) => {
        // Should never happen: the use case only ever gets here via a repository lookup by
        // the token's hash, which can't succeed without emailVerification being set. If it's null
        // anyway, that's a programmer error, not a legitimate outcome to report as a 4xx —
        // let it throw and surface as a 500, like any other unexpected exception.
        if (!this.emailVerification) {
            throw new Error('User.verifyEmail called without a pending email verification');
        }

        if (this.emailVerification.expiresAt < now) return [null, 'EMAIL_VERIFICATION_EXPIRED'] as const;

        return [new User(this.id, this.email, this.passwordHash, true, null, this.createdAt, now), null] as const;
    };

    private static validateEmail = (email: string) => {
        // Strict on purpose: the email must already be lowercase (and the regex rejects any whitespace), so what is stored
        // is exactly what clients send, at registration as well as at login
        if (email !== email.toLowerCase() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'EMAIL_INVALID' as const;
        }

        return null;
    };

    private static validatePassword = (password: string) => {
        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/\d/.test(password) ||
            !/[!@#$%^&*(),.?":{}|<>]/.test(password)
        ) {
            return 'PASSWORD_TOO_WEAK' as const;
        }

        return null;
    };

    static reconstitute = (
        id: UserId,
        email: string,
        passwordHash: string,
        isEmailVerified: boolean,
        emailVerification: EmailVerification | null,
        createdAt: Date,
        updatedAt: Date,
    ) => {
        return new User(id, email, passwordHash, isEmailVerified, emailVerification, createdAt, updatedAt);
    };

    // Only exposes how to rebuild an email verification from the database: creating one stays reserved to User
    static reconstituteEmailVerification = EmailVerification.reconstitute;
}
