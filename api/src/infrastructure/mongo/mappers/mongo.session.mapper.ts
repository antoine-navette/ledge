import type { UserId } from '../../../domain/entities/user.js';
import { ObjectId } from 'mongodb';
import { Session, type SessionId } from '../../../domain/entities/session.js';
import type { MongoSessionDocument } from '../documents/mongo.session.document.js';

export const MongoSessionMapper = {
    toInfrastructure: (session: Session): MongoSessionDocument => ({
        _id: new ObjectId(session.id),
        userId: new ObjectId(session.userId),
        token: session.token,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    }),

    toDomain: (document: MongoSessionDocument): Session =>
        Session.reconstitute(
            document._id.toString() as SessionId,
            document.userId.toString() as UserId,
            document.token,
            document.expiresAt,
            document.createdAt,
            document.updatedAt,
        ),
};
