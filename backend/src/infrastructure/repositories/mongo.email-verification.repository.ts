import { Collection, ObjectId } from 'mongodb';
import type { EmailVerificationRepository } from '../../domain/repositories/email-verification.repository.js';
import type { EmailVerification } from '../../domain/entities/email-verification.js';
import type { EmailVerificationDocument } from '../types/mongo.email-verification.document.js';
import { toEmailVerification, toEmailVerificationDocument } from '../mappers/mongo.email-verification.mapper.js';

export class MongoEmailVerificationRepository implements EmailVerificationRepository {
    constructor(private emailVerificationCollection: Collection<EmailVerificationDocument>) {}

    create = async (emailVerification: EmailVerification): Promise<void> => {
        await this.emailVerificationCollection.insertOne(toEmailVerificationDocument(emailVerification));
    };

    findByUserId = async (userId: string): Promise<EmailVerification | null> => {
        const document = await this.emailVerificationCollection.findOne({ userId: new ObjectId(userId) });

        return document ? toEmailVerification(document) : null;
    };

    findByToken = async (token: string): Promise<EmailVerification | null> => {
        const document = await this.emailVerificationCollection.findOne({ token });

        return document ? toEmailVerification(document) : null;
    };

    delete = async (emailVerification: EmailVerification): Promise<void> => {
        await this.emailVerificationCollection.deleteOne({ _id: new ObjectId(emailVerification.id) });
    };
}
