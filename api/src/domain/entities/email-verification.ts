export class EmailVerification {
    static readonly TOKEN_LENGTH = 64;
    private static readonly DURATION = 60 * 60 * 1000;

    private constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly token: string,
        public readonly expiresAt: Date,
        public readonly createdAt: Date,
    ) {}

    static create = (id: string, userId: string, token: string) => {
        const now = new Date();

        return new EmailVerification(id, userId, token, new Date(now.getTime() + EmailVerification.DURATION), now);
    };

    static reconstitute = (
        id: string,
        userId: string,
        token: string,
        expiresAt: Date,
        createdAt: Date,
    ) => {
        return new EmailVerification(id, userId, token, expiresAt, createdAt);
    };
}
