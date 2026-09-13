import { describe, expect, it } from 'vitest';
import { BcryptPasswordHasher } from './bcrypt.password-hasher.js';

describe('BcryptPasswordHasher', () => {
    const passwordHasher = new BcryptPasswordHasher();

    describe('hash', () => {
        it('should generate a hash different from the raw password', async () => {
            const password = 'my-secret-password';

            const hash = await passwordHasher.hash(password);
            expect(hash).not.toBe(password);
        });

        it('should generate a different hash for the same password each time (salting)', async () => {
            const password = 'my-secret-password';

            const firstHash = await passwordHasher.hash(password);
            const secondHash = await passwordHasher.hash(password);
            expect(firstHash).not.toBe(secondHash);
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
