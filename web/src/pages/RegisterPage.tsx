import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../services/auth.ts';
import { useAuth } from '../contexts/AuthContext.ts';
import { ERROR_MESSAGES, type ErrorCode } from '../constants/errors.ts';

const RegisterPage = () => {
    const auth = useAuth();

    const [state, setState] = useState<
        { status: 'idle' } | { status: 'loading' } | { status: 'error'; code: ErrorCode }
    >({ status: 'idle' });

    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setState({ status: 'loading' });

        const [user, code] = await register(form.email.trim(), form.password);
        if (code) {
            setState({ status: 'error', code });
            return;
        }

        auth.setUser(user); // RequireGuest will redirect us to home
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create an Account</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer select-none"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={form.email}
                            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value.toLowerCase() }))}
                            className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer select-none"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={form.password}
                            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                            className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300"
                            required
                            minLength={8}
                        />
                    </div>

                    {state.status === 'error' && (
                        <div className="p-3 rounded bg-red-50 text-red-600 text-sm text-center font-medium border border-red-100">
                            {ERROR_MESSAGES[state.code]}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={state.status === 'loading'}
                        className={`w-full text-white font-semibold py-2 px-4 rounded transition duration-200
                            ${state.status === 'loading' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
                    >
                        {state.status === 'loading' ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
