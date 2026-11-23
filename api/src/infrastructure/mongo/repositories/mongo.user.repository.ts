import { Collection, MongoServerError, ObjectId } from 'mongodb';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { User } from '../../../domain/entities/user.js';
import type { MongoUserDocument } from '../documents/mongo.user.document.js';
import { MongoUserMapper } from '../mappers/mongo.user.mapper.js';

export class MongoUserRepository implements UserRepository {
    constructor(private userCollection: Collection<MongoUserDocument>) {}

    create = async (user: User) => {
        const document = MongoUserMapper.toInfrastructure(user);

        try {
            await this.userCollection.insertOne(document);
            return null;
        } catch (err) {
            // Duplicate key on the unique email index: the email is already in use
            if (err instanceof MongoServerError && err.code === 11000 && err['keyPattern']?.email) {
                return 'EMAIL_ALREADY_IN_USE' as const;
            }
            throw err;
        }
    };

    findById = async (id: User['id']): Promise<User | null> => {
        if (!ObjectId.isValid(id)) return null;

        const document = await this.userCollection.findOne({ _id: new ObjectId(id) });

        return document ? MongoUserMapper.toDomain(document) : null;
    };

    findByEmail = async (email: User['email']): Promise<User | null> => {
        const document = await this.userCollection.findOne({ email });

        return document ? MongoUserMapper.toDomain(document) : null;
    };

    findByEmailVerificationTokenHash = async (
        tokenHash: NonNullable<User['emailVerification']>['tokenHash'],
    ): Promise<User | null> => {
        const document = await this.userCollection.findOne({ 'emailVerification.tokenHash': tokenHash });

        return document ? MongoUserMapper.toDomain(document) : null;
    };

    save = async (user: User): Promise<void> => {
        const { _id, ...rest } = MongoUserMapper.toInfrastructure(user);

        await this.userCollection.updateOne({ _id }, { $set: rest });
    };
}
