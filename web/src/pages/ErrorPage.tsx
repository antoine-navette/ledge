import { useNavigate } from 'react-router-dom';
import { ERROR_MESSAGES, ERROR_TITLES, type ErrorCode } from '../constants/errors.ts';

type Props = {
    code: ErrorCode;
    // When there is nowhere to go back to, e.g. when the app itself couldn't start
    hideBack?: boolean;
};

// Only transient errors are worth trying again, by reloading the whole app which runs everything again from the start
const RETRYABLE_CODES: ErrorCode[] = ['NETWORK_ERROR', 'INTERNAL_SERVER_ERROR', 'TOO_MANY_REQUESTS'];

const ErrorPage = ({ code, hideBack = false }: Props) => {
    const navigate = useNavigate();

    const handleBack = () => {
        // React Router stores its position in the browser's history entry: a positive index means a previous page
        // within the app. window.history.length would also count the pages of other sites visited in the tab
        const state: unknown = window.history.state;
        const canGoBack =
            typeof state === 'object' &&
            state !== null &&
            'idx' in state &&
            typeof state.idx === 'number' &&
            state.idx > 0;

        if (canGoBack) {
            void navigate(-1);
            return;
        }
        void navigate('/');
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-4 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">{ERROR_TITLES[code] ?? 'Something went wrong'}</h1>
            <p className="text-gray-600">{ERROR_MESSAGES[code]}</p>

            <div className="flex gap-3">
                {!hideBack && (
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition cursor-pointer"
                    >
                        Back
                    </button>
                )}

                {RETRYABLE_CODES.includes(code) && (
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorPage;
