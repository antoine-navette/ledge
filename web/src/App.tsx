import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import MonthPage from './pages/MonthPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import VerifyEmailPage from './pages/VerifyEmailPage.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import { useEffect } from 'react';
import AuthGuard from './guards/AuthGuard.tsx';
import GuestGuard from './guards/GuestGuard.tsx';
import AppLayout from './layouts/AppLayout.tsx';

function App() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <Routes>
            <Route element={<GuestGuard />}>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<AuthGuard />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to={`/${new Date().getFullYear()}`} replace />} />
                    <Route path="/:year" element={<HomePage />} />
                    <Route path="/:year/:month" element={<MonthPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    {/* Under the guard: the app is private, so a visitor who isn't signed in is sent to the login
                        page, and a signed-in user sees the 404 within the app, with the navigation */}
                    <Route path="*" element={<ErrorPage code="ROUTE_NOT_FOUND" />} />
                </Route>
            </Route>

            {/* Opened from an email, signed in or not */}
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        </Routes>
    );
}

export default App;
