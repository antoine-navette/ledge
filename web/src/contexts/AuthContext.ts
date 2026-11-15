import type { User } from '../entities/User';
import { createContext } from 'react';

export const AuthContext = createContext<{ user: User | null; setUser: (user: User | null) => void } | undefined>(
    undefined,
);
