import type { Session } from '../entities/session.js';

export interface SessionRepository {
    create: (session: Session) => Promise<void>;
    findByTokenHash: (tokenHash: Session['tokenHash']) => Promise<Session | null>;
    save: (session: Session) => Promise<void>;
    delete: (session: Session) => Promise<void>;
}
