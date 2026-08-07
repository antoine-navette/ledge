import { describe, expect, it } from 'vitest';
import { BcryptPasswordHasher } from '../../../../src/infrastructure/adapters/bcrypt.password-hasher.js';

describe('BcryptPasswordHasher', () => {
    const passwordHasher = new BcryptPasswordHasher();

    describe('hash', () => {
        it('should generate a hash different from the raw password', async () => {
            const password = 'my-secret-password';
            const hash = await passwordHasher.hash(password);

            expect(hash).not.toBe(password);
            expect(hash).toHaveLength(60);
        });
    });

    describe('compare', () => {
        it('should return true for a valid password', async () => {
            const password = 'password123';
            const hash = await passwordHasher.hash(password);

            const result = await passwordHasher.compare(password, hash);
            expect(result).toBe(true);
        });

        it('should return false for an invalid password', async () => {
            const password = 'password123';
            const hash = await passwordHasher.hash(password);

            const result = await passwordHasher.compare('wrong-password', hash);
            expect(result).toBe(false);
        });
    });
});
