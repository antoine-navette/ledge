import type { Session } from '../entities/session.js';

export interface SessionRepository {
    create: (session: Session) => Promise<void>;
    findByToken: (token: string) => Promise<Session | null>;
    delete: (session: Session) => Promise<void>;
}
