import { NavLink } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.ts';

const Navbar = () => {
    const [state, setState] = useState<{ status: 'idle' } | { status: 'loading' }>({ status: 'idle' });

    const auth = useAuth();

    const handleLogout = async () => {
        setState({ status: 'loading' });

        await AuthService.logout(); // We don't really care if an error occurred

        auth.setUser(null); // RequireAuth will redirect us to login
    };

    return (
        <nav className="bg-white shadow px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <NavLink to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition">
                    Ledge
                </NavLink>

                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `text-sm ${
                            isActive
                                ? 'text-blue-600 underline underline-offset-4'
                                : 'text-gray-600 hover:text-blue-600'
                        } transition`
                    }
                >
                    Home
                </NavLink>
            </div>

            <div className="flex items-center gap-4">
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `text-sm ${
                            isActive
                                ? 'text-blue-600 underline underline-offset-4'
                                : 'text-gray-600 hover:text-blue-600'
                        } transition`
                    }
                >
                    Profile
                </NavLink>
                <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer transition disabled:opacity-50"
                    onClick={handleLogout}
                    disabled={state.status === 'loading'}
                >
                    {state.status === 'loading' ? 'Logging out...' : 'Logout'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
