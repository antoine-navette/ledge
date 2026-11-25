import { Collection } from 'mongodb';
import type { SessionRepository } from '../../../domain/repositories/session.repository.js';
import type { Session } from '../../../domain/entities/session.js';
import type { MongoSessionDocument } from '../documents/mongo.session.document.js';
import { MongoSessionMapper } from '../mappers/mongo.session.mapper.js';

export class MongoSessionRepository implements SessionRepository {
    constructor(private sessionCollection: Collection<MongoSessionDocument>) {}

    create = async (session: Session): Promise<void> => {
        const document = MongoSessionMapper.toInfrastructure(session);

        await this.sessionCollection.insertOne(document);
    };

    findByTokenHash = async (tokenHash: Session['tokenHash']): Promise<Session | null> => {
        const document = await this.sessionCollection.findOne({ tokenHash });

        return document ? MongoSessionMapper.toDomain(document) : null;
    };

    save = async (session: Session): Promise<void> => {
        const { _id, ...rest } = MongoSessionMapper.toInfrastructure(session);

        await this.sessionCollection.updateOne({ _id }, { $set: rest });
    };

    delete = async (session: Session): Promise<void> => {
        const { _id } = MongoSessionMapper.toInfrastructure(session);

        await this.sessionCollection.deleteOne({ _id });
    };
}
