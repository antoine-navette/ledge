import { User } from '../../../domain/entities/user.js';
import { EmailVerification } from '../../../domain/entities/email-verification.js';
import type { MongoUserDocument } from '../documents/mongo.user.document.js';
import { ObjectId } from 'mongodb';

export const MongoUserMapper = {
    toDocument: (user: User): MongoUserDocument => ({
        _id: new ObjectId(user.id),
        email: user.email,
        passwordHash: user.passwordHash,
        isEmailVerified: user.isEmailVerified,
        emailVerification: user.emailVerification
            ? {
                  token: user.emailVerification.token,
                  expiresAt: user.emailVerification.expiresAt,
                  createdAt: user.emailVerification.createdAt,
              }
            : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }),

    toEntity: (document: MongoUserDocument): User =>
        User.reconstitute(
            document._id.toString(),
            document.email,
            document.passwordHash,
            document.isEmailVerified,
            document.emailVerification
                ? EmailVerification.reconstitute(
                      document.emailVerification.token,
                      document.emailVerification.expiresAt,
                      document.emailVerification.createdAt,
                  )
                : null,
            document.createdAt,
            document.updatedAt,
        ),
};
