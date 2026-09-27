export class Session {
    static readonly TOKEN_LENGTH = 64;
    private static readonly DURATION = 30 * 24 * 60 * 60 * 1000;

    private constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly token: string,
        public readonly expiresAt: Date,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create = (id: string, userId: string, token: string, now: Date) => {
        // Token length is a security property, not an incidental format detail: a token of
        // the wrong length means the caller's TokenGenerator wiring is broken, which could
        // silently weaken every session lookup (sessions are found by token alone, with no
        // other authentication). That's a programmer error, not a legitimate outcome to
        // report as a 4xx — let it throw and surface as a 500.
        if (token.length !== Session.TOKEN_LENGTH) {
            throw new Error(`Session.create called with a token of length ${token.length}, expected ${Session.TOKEN_LENGTH}`);
        }

        return new Session(id, userId, token, new Date(now.getTime() + Session.DURATION), now, now);
    };

    extend = (now: Date) => {
        return new Session(
            this.id,
            this.userId,
            this.token,
            new Date(now.getTime() + Session.DURATION),
            this.createdAt,
            now,
        );
    };

    static reconstitute = (
        id: string,
        userId: string,
        token: string,
        expiresAt: Date,
        createdAt: Date,
        updatedAt: Date,
    ) => {
        return new Session(id, userId, token, expiresAt, createdAt, updatedAt);
    };
}
