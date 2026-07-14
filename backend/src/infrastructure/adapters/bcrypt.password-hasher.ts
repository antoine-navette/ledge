import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../domain/ports/password-hasher.js';

export class BcryptPasswordHasher implements PasswordHasher {
    hash = async (value: string) => {
        return await bcrypt.hash(value, 12);
    };

    compare = async (raw: string, hash: string) => {
        return await bcrypt.compare(raw, hash);
    };
}
