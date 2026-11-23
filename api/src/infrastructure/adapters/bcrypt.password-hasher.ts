import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../domain/ports/password-hasher.js';

export class BcryptPasswordHasher implements PasswordHasher {
    hash = async (password: string) => {
        return await bcrypt.hash(password, 12);
    };

    // Hash of a random password, compared when there is no user, so that the response takes as long and doesn't reveal
    // whether the email is registered
    private dummyHash = this.hash(randomUUID());

    compare = async (password: string, passwordHash: string | null) => {
        if (passwordHash === null) {
            await bcrypt.compare(password, await this.dummyHash);
            return false;
        }

        return await bcrypt.compare(password, passwordHash);
    };
}
