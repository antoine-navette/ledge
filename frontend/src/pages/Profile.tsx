import { useState } from 'react';
import { EmailVerificationService } from '../services/EmailVerificationService';
import Navbar from '../components/Navbar.tsx';
import { useAuth } from '../hooks/useAuth.ts';

const Profile = () => {
    const [state, setState] = useState<
        { status: 'idle' } | { status: 'loading' } | { status: 'success' } | { status: 'error'; message: string }
    >({ status: 'idle' });

    const auth = useAuth();
    if (auth.state.status !== 'success' || !auth.state.user) return;

    const handleClick = async () => {
        setState({ status: 'loading' });

        const { error } = await EmailVerificationService.create();
        if (error) {
            setState({ status: 'error', message: error.code });
            return;
        }

        setState({ status: 'success' });
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col flex-1 items-center justify-center p-4">
                <h1 className="text-4xl font-bold mb-4">Profile page</h1>
                <p className="text-lg mb-6">This is the profile page.</p>
                {!auth.state.user.isEmailVerified && (
                    <>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                            onClick={handleClick}
                            disabled={state.status === 'loading'}
                        >
                            {state.status === 'loading' ? 'Sending...' : 'Request email verification'}
                        </button>
                        {state.status === 'success' && (
                            <div className="mt-4 text-green-600">Email sent successfully!</div>
                        )}
                        {state.status === 'error' && <div className={'mt-4 text-red-600'}>{state.message}</div>}
                    </>
                )}
            </div>
        </>
    );
};

export default Profile;
