import type { User } from '../entities/User';
import { createContext } from 'react';

export type AuthState = { status: 'loading' } | { status: 'success'; user: User | null };

type AuthContext = {
    state: AuthState;
    setUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContext | undefined>(undefined);
