import { Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/Home';
import MonthPage from './pages/Month';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import RouteNotFound from './pages/RouteNotFound.tsx';
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
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Route>

                <Route element={<RequireAuth />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/month/:month" element={<MonthPage />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>

                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="*" element={<RouteNotFound />} />
            </Routes>
        </div>
    );
}

export default App;
