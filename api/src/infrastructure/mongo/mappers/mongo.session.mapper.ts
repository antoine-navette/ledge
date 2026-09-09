import { ObjectId } from 'mongodb';
import { Session } from '../../../domain/entities/session.js';
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

    toEntity: (document: MongoSessionDocument): Session =>
        Session.reconstitute(
            document._id.toString(),
            document.userId.toString(),
            document.token,
            document.expiresAt,
            document.createdAt,
            document.updatedAt,
        ),
};
