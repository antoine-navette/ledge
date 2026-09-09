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

    static create = (id: string, userId: string, token: string) => {
        const now = new Date();

        return new Session(id, userId, token, new Date(now.getTime() + Session.DURATION), now, now);
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
