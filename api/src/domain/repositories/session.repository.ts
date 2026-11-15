import type { Session } from '../entities/session.js';

export interface SessionRepository {
    create: (session: Session) => Promise<void>;
    findByToken: (token: Session['token']) => Promise<Session | null>;
    save: (session: Session) => Promise<void>;
    delete: (session: Session) => Promise<void>;
}
