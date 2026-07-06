import type { TokenGenerator } from '../../domain/ports/token-generator.js';
import crypto from 'crypto';

export class CryptoTokenGenerator implements TokenGenerator {
    generate = (length: number) => {
        length = Math.abs(Math.floor(length));
        const byteLength = Math.ceil(length / 2);

        return crypto.randomBytes(byteLength).toString('hex').slice(0, length);
    };
}
