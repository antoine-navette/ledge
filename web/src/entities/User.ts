export type User = Readonly<{
    id: string;
    email: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
