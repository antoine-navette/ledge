export interface PasswordHasher {
    hash: (password: string) => Promise<string>;
    // A null hash (no such user) is compared too, and is never correct: see the adapter
    compare: (password: string, passwordHash: string | null) => Promise<boolean>;
}
