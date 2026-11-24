import { useState } from 'react';
import { requestEmailVerification } from '../services/email-verification.ts';
import { useAuth } from '../contexts/AuthContext.ts';
import { ERROR_MESSAGES, type ErrorCode } from '../constants/errors.ts';

const ProfilePage = () => {
    const [state, setState] = useState<
        { status: 'idle' } | { status: 'loading' } | { status: 'success' } | { status: 'error'; code: ErrorCode }
    >({ status: 'idle' });

    const auth = useAuth();
    // Always nested in AuthGuard
    if (!auth.user) return;

    const handleClick = async () => {
        setState({ status: 'loading' });

        const code = await requestEmailVerification();
        if (code) {
            setState({ status: 'error', code });
            return;
        }

        setState({ status: 'success' });
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4">Profile page</h1>
            <p className="text-lg mb-6">This is the profile page.</p>
            {!auth.user.isEmailVerified && (
                <>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                        onClick={handleClick}
                        disabled={state.status === 'loading'}
                    >
                        {state.status === 'loading' ? 'Sending...' : 'Request email verification'}
                    </button>

                    {state.status === 'success' && <div className="mt-4 text-green-600">Email sent successfully!</div>}

                    {state.status === 'error' && (
                        <div className={'mt-4 text-red-600'}>{ERROR_MESSAGES[state.code]}</div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfilePage;
