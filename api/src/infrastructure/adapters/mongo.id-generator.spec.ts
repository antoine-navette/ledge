import { describe, it, expect } from 'vitest';
import { MongoIdGenerator } from './mongo.id-generator.js';

describe('MongoIdGenerator', () => {
    const idGenerator = new MongoIdGenerator();

    describe('generate', () => {
        it('should generate a different id on each call', () => {
            const first = idGenerator.generate();
            const second = idGenerator.generate();
            expect(first).not.toBe(second);
        });
    });
});
