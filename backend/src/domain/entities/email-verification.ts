export type EmailVerification = Readonly<{
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}>;
