import { useAuth } from '../contexts/AuthContext.ts';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
    const auth = useAuth();
    if (!auth.user) return <Navigate to="/login" replace />;

    return <Outlet />;
};

export default AuthGuard;
