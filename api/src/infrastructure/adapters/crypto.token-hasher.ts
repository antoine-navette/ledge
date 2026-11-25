import { createHash } from 'node:crypto';
import type { TokenHasher } from '../../domain/ports/token-hasher.js';

// SHA-256 rather than a password hash (bcrypt): a token is long and random, so a fast hash can't be brute-forced, and it
// is computed on every authenticated request
export class CryptoTokenHasher implements TokenHasher {
    hash = (token: string) => {
        return createHash('sha256').update(token).digest('hex');
    };
}
