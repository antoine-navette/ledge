import type { ObjectId } from 'mongodb';

export type MongoUserDocument = {
    _id: ObjectId;
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
    emailVerification: {
        tokenHash: string;
        expiresAt: Date;
        createdAt: Date;
    } | null;
    createdAt: Date;
    updatedAt: Date;
};
