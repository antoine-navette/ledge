import type { IdGenerator } from '../../domain/ports/id-generator.js';
import { ObjectId } from 'mongodb';

export class MongoIdGenerator implements IdGenerator {
    generate = () => {
        return new ObjectId().toString();
    };
}
