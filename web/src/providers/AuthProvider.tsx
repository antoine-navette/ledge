import { type ReactNode, useCallback, useEffect, useState } from 'react';
import type { User } from '../entities/User';
import { AuthContext } from '../contexts/AuthContext.ts';
import { me } from '../services/user.ts';
import { onUnauthorized } from '../config/http.ts';
import ErrorPage from '../pages/ErrorPage.tsx';

// Children are only rendered once the session is known, so the rest of the app never deals with loading or errors
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // UNAUTHORIZED only means there is no session, so it is a success with no user: any other code says nothing about
    // the session (network, server, rate limit) and must not be mistaken for being logged out
    const [state, setState] = useState<
        | { status: 'loading' }
        | { status: 'error'; code: Exclude<Awaited<ReturnType<typeof me>>[1], 'UNAUTHORIZED' | null> }
        | { status: 'success'; user: User | null }
    >({ status: 'loading' });

    // Stable across renders, since the onUnauthorized effect depends on it
    const setUser = useCallback((user: User | null) => setState({ status: 'success', user }), []);

    useEffect(() => {
        const initAuth = async () => {
            const [user, code] = await me();
            if (code) {
                if (code === 'UNAUTHORIZED') return setUser(null);
                return setState({ status: 'error', code });
            }

            setUser(user);
        };

        void initAuth();
    }, [setUser]);

    // Any UNAUTHORIZED answer means the session is gone: the guards then redirect to the login page
    useEffect(() => onUnauthorized(() => setUser(null)), [setUser]);

    if (state.status === 'loading') {
        return <div className="flex flex-col flex-1 items-center justify-center p-4">Loading...</div>;
    }

    if (state.status === 'error') {
        return <ErrorPage code={state.code} />;
    }

    return <AuthContext.Provider value={{ user: state.user, setUser }}>{children}</AuthContext.Provider>;
};
