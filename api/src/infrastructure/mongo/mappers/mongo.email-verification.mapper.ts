import { ObjectId } from 'mongodb';
import { EmailVerification } from '../../../domain/entities/email-verification.js';
import type { MongoEmailVerificationDocument } from '../documents/mongo.email-verification.document.js';

export const MongoEmailVerificationMapper = {
    toDocument: (emailVerification: EmailVerification): MongoEmailVerificationDocument => ({
        _id: new ObjectId(emailVerification.id),
        userId: new ObjectId(emailVerification.userId),
        token: emailVerification.token,
        expiresAt: emailVerification.expiresAt,
        createdAt: emailVerification.createdAt,
    }),

    toEntity: (document: MongoEmailVerificationDocument): EmailVerification =>
        EmailVerification.reconstitute(
            document._id.toString(),
            document.userId.toString(),
            document.token,
            document.expiresAt,
            document.createdAt,
        ),
};
