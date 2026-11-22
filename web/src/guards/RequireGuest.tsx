import { useAuth } from '../contexts/AuthContext.ts';
import { Navigate, Outlet } from 'react-router-dom';

const RequireGuest = () => {
    const auth = useAuth();
    if (auth.user) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default RequireGuest;
