import { useEffect, useState, type ReactNode } from 'react';
import { UserService } from '../services/UserService';
import type { User } from '../entities/User';
import { AuthContext, AuthState } from '../contexts/AuthContext.ts';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthState>({ status: 'loading' });

    useEffect(() => {
        const initAuth = async () => {
            const { data } = await UserService.me();
            setState({ status: 'success', user: data ?? null });
        };

        void initAuth();
    }, []);

    const setUser = (user: User | null) => setState({ status: 'success', user });

    return <AuthContext.Provider value={{ state, setUser }}>{children}</AuthContext.Provider>;
};
