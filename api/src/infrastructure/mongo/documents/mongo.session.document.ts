import type { ObjectId } from 'mongodb';

export type MongoSessionDocument = Readonly<{
    _id: ObjectId;
    userId: ObjectId;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
