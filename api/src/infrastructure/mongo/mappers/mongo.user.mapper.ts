import { User, type UserId } from '../../../domain/entities/user.js';
import type { MongoUserDocument } from '../documents/mongo.user.document.js';
import { ObjectId } from 'mongodb';

export const MongoUserMapper = {
    toInfrastructure: (user: User): MongoUserDocument => ({
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

    toDomain: (document: MongoUserDocument): User =>
        User.reconstitute(
            document._id.toString() as UserId,
            document.email,
            document.passwordHash,
            document.isEmailVerified,
            document.emailVerification
                ? User.reconstituteEmailVerification(
                      document.emailVerification.token,
                      document.emailVerification.expiresAt,
                      document.emailVerification.createdAt,
                  )
                : null,
            document.createdAt,
            document.updatedAt,
        ),
};
