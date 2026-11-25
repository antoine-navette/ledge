import type { TokenHasher } from '../ports/token-hasher.js';
import type { UserId } from './user.js';

export type SessionId = string & { readonly __brand: 'SessionId' };

export class Session {
    // Never set at runtime: only makes the class nominal, so a plain object can't be passed off as a Session without
    // going through its factories
    declare private readonly brand: 'Session';

    static readonly TOKEN_LENGTH = 64;
    private static readonly DURATION = 30 * 24 * 60 * 60 * 1000;

    private constructor(
        public readonly id: SessionId,
        public readonly userId: UserId,
        // Only the token's hash is stored: a copy of the database then can't be used to act as anyone
        public readonly tokenHash: string,
        public readonly expiresAt: Date,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create = (id: SessionId, userId: UserId, token: string, tokenHasher: TokenHasher, now: Date) => {
        // Token length is a security property, not an incidental format detail: a token of
        // the wrong length means the caller's TokenGenerator wiring is broken, which could
        // silently weaken every session lookup (sessions are found by their token's hash alone, with no
        // other authentication). That's a programmer error, not a legitimate outcome to
        // report as a 4xx — let it throw and surface as a 500.
        if (token.length !== Session.TOKEN_LENGTH) {
            throw new Error(
                `Session.create called with a token of length ${token.length}, expected ${Session.TOKEN_LENGTH}`,
            );
        }

        return new Session(id, userId, tokenHasher.hash(token), new Date(now.getTime() + Session.DURATION), now, now);
    };

    extend = (now: Date) => {
        return new Session(
            this.id,
            this.userId,
            this.tokenHash,
            new Date(now.getTime() + Session.DURATION),
            this.createdAt,
            now,
        );
    };

    static reconstitute = (
        id: SessionId,
        userId: UserId,
        tokenHash: string,
        expiresAt: Date,
        createdAt: Date,
        updatedAt: Date,
    ) => {
        return new Session(id, userId, tokenHash, expiresAt, createdAt, updatedAt);
    };
}
