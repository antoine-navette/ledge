import type { ObjectId } from 'mongodb';

export type MongoUserDocument = Readonly<{
    _id: ObjectId;
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
