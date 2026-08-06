import type { User } from '../entities/User';
import { createContext } from 'react';

export type AuthState = { status: 'loading' } | { status: 'success'; user: User | null };

export const AuthContext = createContext<{ state: AuthState; setUser: (user: User | null) => void } | undefined>(
    undefined,
);
