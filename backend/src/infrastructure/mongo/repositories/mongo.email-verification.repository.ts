import { Collection, ObjectId } from 'mongodb';
import type { EmailVerificationRepository } from '../../../domain/repositories/email-verification.repository.js';
import type { EmailVerification } from '../../../domain/entities/email-verification.js';
import type { MongoEmailVerificationDocument } from '../documents/mongo.email-verification.document.js';
import { MongoEmailVerificationMapper } from '../mappers/mongo.email-verification.mapper.js';

export class MongoEmailVerificationRepository implements EmailVerificationRepository {
    constructor(private emailVerificationCollection: Collection<MongoEmailVerificationDocument>) {}

    create = async (emailVerification: EmailVerification): Promise<void> => {
        await this.emailVerificationCollection.insertOne(MongoEmailVerificationMapper.toDocument(emailVerification));
    };

    findByUserId = async (userId: EmailVerification['userId']): Promise<EmailVerification | null> => {
        const document = await this.emailVerificationCollection.findOne({ userId: new ObjectId(userId) });

        return document ? MongoEmailVerificationMapper.toEntity(document) : null;
    };

    findByToken = async (token: EmailVerification['token']): Promise<EmailVerification | null> => {
        const document = await this.emailVerificationCollection.findOne({ token });

        return document ? MongoEmailVerificationMapper.toEntity(document) : null;
    };

    delete = async (emailVerification: EmailVerification): Promise<void> => {
        await this.emailVerificationCollection.deleteOne({ _id: new ObjectId(emailVerification.id) });
    };
}
