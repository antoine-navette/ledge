import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import MonthPage from './pages/MonthPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import VerifyEmailPage from './pages/VerifyEmailPage.tsx';
import RouteNotFoundPage from './pages/RouteNotFoundPage.tsx';
import { useEffect } from 'react';
import RequireAuth from './guards/RequireAuth.tsx';
import RequireGuest from './guards/RequireGuest.tsx';

function App() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Routes>
                <Route element={<RequireGuest />}>
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Route>

                <Route element={<RequireAuth />}>
                    <Route path="/" element={<Navigate to={`/${new Date().getFullYear()}`} replace />} />
                    <Route path="/:year" element={<HomePage />} />
                    <Route path="/:year/:month" element={<MonthPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>

                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                <Route path="*" element={<RouteNotFoundPage />} />
            </Routes>
        </div>
    );
}

export default App;
