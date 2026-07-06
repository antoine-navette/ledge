import { describe, it, expect } from 'vitest';
import { fakeUser } from '../../../../fakes/user.js';
import { MongoUserMapper } from '../../../../../src/infrastructure/mongo/mappers/mongo.user.mapper.js';
import { ObjectId } from 'mongodb';

describe('MongoUserMapper', () => {
    describe('toDocument', () => {
        it('should map a valid User to a MongoUserDocument correctly', () => {
            const user = fakeUser();

            const document = MongoUserMapper.toDocument(user);

            expect(document._id).toBeInstanceOf(ObjectId);
            expect(document._id.toString()).toBe(user.id);

            expect(document).toMatchObject({
                email: user.email,
                passwordHash: user.passwordHash,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        });

        it('should throw an error when providing an invalid ID format', () => {
            const user = fakeUser({ id: 'invalid-id' });

            expect(() => MongoUserMapper.toDocument(user)).toThrow();
        });
    });

    describe('toEntity', () => {
        it('should map a MongoUserDocument back to a User domain entity', () => {
            const originalUser = fakeUser();
            const document = MongoUserMapper.toDocument(originalUser);

            const domainUser = MongoUserMapper.toEntity(document);

            expect(domainUser).toEqual(originalUser);
        });
    });
});
