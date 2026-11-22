import type { User } from '../entities/User';
import { createContext, useContext } from 'react';

export const AuthContext = createContext<{ user: User | null; setUser: (user: User | null) => void } | undefined>(
    undefined,
);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');

    return context;
};
