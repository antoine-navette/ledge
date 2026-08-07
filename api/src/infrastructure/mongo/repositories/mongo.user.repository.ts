import { Collection, ObjectId } from 'mongodb';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { User } from '../../../domain/entities/user.js';
import type { MongoUserDocument } from '../documents/mongo.user.document.js';
import { MongoUserMapper } from '../mappers/mongo.user.mapper.js';

export class MongoUserRepository implements UserRepository {
    constructor(private userCollection: Collection<MongoUserDocument>) {}

    create = async (user: User): Promise<void> => {
        const document = MongoUserMapper.toDocument(user);

        await this.userCollection.insertOne(document);
    };

    findById = async (id: User['id']): Promise<User | null> => {
        const document = await this.userCollection.findOne({ _id: new ObjectId(id) });

        return document ? MongoUserMapper.toEntity(document) : null;
    };

    findByEmail = async (email: User['email']): Promise<User | null> => {
        const document = await this.userCollection.findOne({ email });

        return document ? MongoUserMapper.toEntity(document) : null;
    };

    save = async (user: User): Promise<void> => {
        const { _id, ...rest } = MongoUserMapper.toDocument(user);

        await this.userCollection.updateOne({ _id }, { $set: rest });
    };
}
