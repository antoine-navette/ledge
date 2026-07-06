import { Collection, ObjectId } from 'mongodb';
import type { SessionRepository } from '../../../domain/repositories/session.repository.js';
import type { Session } from '../../../domain/entities/session.js';
import type { MongoSessionDocument } from '../documents/mongo.session.document.js';
import { MongoSessionMapper } from '../mappers/mongo.session.mapper.js';

export class MongoSessionRepository implements SessionRepository {
    constructor(private sessionCollection: Collection<MongoSessionDocument>) {}

    create = async (session: Session): Promise<void> => {
        await this.sessionCollection.insertOne(MongoSessionMapper.toDocument(session));
    };

    findByToken = async (token: string): Promise<Session | null> => {
        const document = await this.sessionCollection.findOne({ token });

        return document ? MongoSessionMapper.toEntity(document) : null;
    };

    delete = async (session: Session): Promise<void> => {
        await this.sessionCollection.deleteOne({ _id: new ObjectId(session.id) });
    };
}
