import { describe, it, expect } from 'vitest';
import { CryptoTokenGenerator } from './crypto.token-generator.js';

describe('CryptoTokenGenerator', () => {
    const tokenGenerator = new CryptoTokenGenerator();

    describe('generate', () => {
        it('should generate a token of the requested length for an even number', () => {
            const token = tokenGenerator.generate(32);
            expect(token).toHaveLength(32);
        });

        it('should generate a token of the requested length for an odd number', () => {
            const token = tokenGenerator.generate(11);
            expect(token).toHaveLength(11);
        });

        it('should generate a valid hexadecimal string', () => {
            const token = tokenGenerator.generate(10);
            expect(token).toMatch(/^[0-9a-f]+$/);
        });

        it('should treat a negative length as its absolute value', () => {
            const token = tokenGenerator.generate(-10);
            expect(token).toHaveLength(10);
        });

        it('should floor a decimal length', () => {
            const token = tokenGenerator.generate(10.9);
            expect(token).toHaveLength(10);
        });
    });
});
