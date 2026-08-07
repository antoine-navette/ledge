import { useAuth } from '../hooks/useAuth.ts';
import { Navigate, Outlet } from 'react-router-dom';

const RequireGuest = () => {
    const auth = useAuth();
    if (auth.state.status === 'loading')
        return <div className="flex flex-col flex-1 items-center justify-center p-4">Loading...</div>;
    if (auth.state.user) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default RequireGuest;
