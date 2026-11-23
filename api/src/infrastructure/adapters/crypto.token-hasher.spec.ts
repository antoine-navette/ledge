import { describe, expect, it } from 'vitest';
import { CryptoTokenHasher } from './crypto.token-hasher.js';

describe('CryptoTokenHasher', () => {
    const tokenHasher = new CryptoTokenHasher();

    describe('hash', () => {
        it('should generate a hash different from the token', () => {
            const token = 'my-secret-token';

            expect(tokenHasher.hash(token)).not.toBe(token);
        });

        it('should always generate the same hash for the same token, so it can be looked up', () => {
            const token = 'my-secret-token';

            expect(tokenHasher.hash(token)).toBe(tokenHasher.hash(token));
        });

        it('should generate different hashes for different tokens', () => {
            expect(tokenHasher.hash('first-token')).not.toBe(tokenHasher.hash('second-token'));
        });
    });
});
