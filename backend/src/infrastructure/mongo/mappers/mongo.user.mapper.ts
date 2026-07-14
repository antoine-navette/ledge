import type { User } from '../../../domain/entities/user.js';
import type { MongoUserDocument } from '../documents/mongo.user.document.js';
import { ObjectId } from 'mongodb';

export const MongoUserMapper = {
    toDocument: (user: User): MongoUserDocument => ({
        _id: new ObjectId(user.id),
        email: user.email,
        passwordHash: user.passwordHash,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }),

    toEntity: (document: MongoUserDocument): User => ({
        id: document._id.toString(),
        email: document.email,
        passwordHash: document.passwordHash,
        isEmailVerified: document.isEmailVerified,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
    }),
};
