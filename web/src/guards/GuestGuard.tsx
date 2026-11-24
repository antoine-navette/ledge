import { useAuth } from '../contexts/AuthContext.ts';
import { Navigate, Outlet } from 'react-router-dom';

const GuestGuard = () => {
    const auth = useAuth();
    if (auth.user) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default GuestGuard;
