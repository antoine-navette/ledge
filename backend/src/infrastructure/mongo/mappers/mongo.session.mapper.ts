import { ObjectId } from 'mongodb';
import type { Session } from '../../../domain/entities/session.js';
import type { MongoSessionDocument } from '../documents/mongo.session.document.js';

export const MongoSessionMapper = {
    toDocument: (session: Session): MongoSessionDocument => ({
        _id: new ObjectId(session.id),
        userId: new ObjectId(session.userId),
        token: session.token,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    }),

    toEntity: (document: MongoSessionDocument): Session => ({
        id: document._id.toString(),
        userId: document.userId.toString(),
        token: document.token,
        expiresAt: document.expiresAt,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
    }),
};
