import { describe, it, expect } from 'vitest';
import { MongoIdGenerator } from '../../../../src/infrastructure/adapters/mongo.id-generator.js';

describe('MongoIdGenerator', () => {
    const idGenerator = new MongoIdGenerator();

    describe('generate', () => {
        it('should generate a valid MongoDB ObjectId string', () => {
            const id = idGenerator.generate();

            expect(typeof id).toBe('string');
            expect(id).toHaveLength(24);
        });
    });
});