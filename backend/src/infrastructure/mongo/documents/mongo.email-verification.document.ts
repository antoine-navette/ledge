import type { ObjectId } from 'mongodb';

export type MongoEmailVerificationDocument = Readonly<{
    _id: ObjectId;
    userId: ObjectId;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}>;
