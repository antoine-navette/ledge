import type { User } from '../../../domain/entities/user.js';
import { ObjectId } from 'mongodb';
import { Session } from '../../../domain/entities/session.js';
import type { MongoSessionDocument } from '../documents/mongo.session.document.js';

export const MongoSessionMapper = {
    toInfrastructure: (session: Session): MongoSessionDocument => ({
        _id: new ObjectId(session.id),
        userId: new ObjectId(session.userId),
        tokenHash: session.tokenHash,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    }),

    toDomain: (document: MongoSessionDocument): Session =>
        Session.reconstitute(
            document._id.toString() as Session['id'],
            document.userId.toString() as User['id'],
            document.tokenHash,
            document.expiresAt,
            document.createdAt,
            document.updatedAt,
        ),
};
