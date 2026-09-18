import type { ObjectId } from 'mongodb';

export type MongoUserDocument = Readonly<{
    _id: ObjectId;
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
    emailVerification: Readonly<{
        token: string;
        expiresAt: Date;
        createdAt: Date;
    }> | null;
    createdAt: Date;
    updatedAt: Date;
}>;
