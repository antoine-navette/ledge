import { useState } from 'react';
import { verifyEmail } from '../services/email-verification.ts';
import { useParams } from 'react-router-dom';
import { ERROR_MESSAGES, type ErrorCode } from '../constants/errors.ts';

export default function VerifyEmailPage() {
    const [state, setState] = useState<
        { status: 'idle' } | { status: 'loading' } | { status: 'success' } | { status: 'error'; code: ErrorCode }
    >({ status: 'idle' });

    const { token } = useParams();
    if (!token) return;

    const handleClick = async () => {
        setState({ status: 'loading' });

        const code = await verifyEmail(token);
        if (code) {
            setState({ status: 'error', code });
            return;
        }

        setState({ status: 'success' });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4">Verify your email</h1>
                {(state.status === 'idle' || state.status === 'loading' || state.status === 'error') && (
                    <>
                        <p className="mb-4">Click the button below to verify your email address.</p>
                        <button
                            onClick={handleClick}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 cursor-pointer"
                            disabled={state.status === 'loading'}
                        >
                            {state.status === 'loading' ? 'Verifying...' : 'Verify Email'}
                        </button>
                        {state.status === 'error' && (
                            <div className="text-red-600">
                                <p>{ERROR_MESSAGES[state.code]}</p>
                            </div>
                        )}
                    </>
                )}

                {state.status === 'success' && (
                    <div className="text-green-600">
                        <p className="mb-2">Email verified successfully!</p>
                        <p>You can now leave this page.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
