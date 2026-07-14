import { useEffect, useState, type ReactNode } from 'react';
import { UserService } from '../services/UserService';
import type { User } from '../entities/User';
import { AuthContext } from '../contexts/AuthContext.ts';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const { data } = await UserService.me();
            if (data) setUser(data);
            setIsLoading(false);
        };

        initAuth();
    }, []);

    return <AuthContext.Provider value={{ user, isLoading, setUser }}>{children}</AuthContext.Provider>;
};
