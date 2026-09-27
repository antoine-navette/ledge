export class EmailVerification {
    static readonly TOKEN_LENGTH = 64;
    static readonly COOLDOWN_DURATION = 5 * 60 * 1000;
    private static readonly DURATION = 60 * 60 * 1000;

    private constructor(
        public readonly token: string,
        public readonly expiresAt: Date,
        public readonly createdAt: Date,
    ) {}

    static create = (token: string, now: Date) => {
        // Same reasoning as Session.create(): token length is a security property, not an
        // incidental format detail — a wrong length means the caller's TokenGenerator wiring
        // is broken, a programmer error, not a legitimate outcome to report as a 4xx.
        if (token.length !== EmailVerification.TOKEN_LENGTH) {
            throw new Error(
                `EmailVerification.create called with a token of length ${token.length}, expected ${EmailVerification.TOKEN_LENGTH}`,
            );
        }

        return new EmailVerification(token, new Date(now.getTime() + EmailVerification.DURATION), now);
    };

    static reconstitute = (token: string, expiresAt: Date, createdAt: Date) => {
        return new EmailVerification(token, expiresAt, createdAt);
    };
}
