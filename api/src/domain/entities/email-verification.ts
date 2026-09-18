export class EmailVerification {
    static readonly TOKEN_LENGTH = 64;
    static readonly COOLDOWN_DURATION = 5 * 60 * 1000;
    private static readonly DURATION = 60 * 60 * 1000;

    private constructor(
        public readonly token: string,
        public readonly expiresAt: Date,
        public readonly createdAt: Date,
    ) {}

    static create = (token: string) => {
        const now = new Date();

        return new EmailVerification(token, new Date(now.getTime() + EmailVerification.DURATION), now);
    };

    static reconstitute = (token: string, expiresAt: Date, createdAt: Date) => {
        return new EmailVerification(token, expiresAt, createdAt);
    };
}
