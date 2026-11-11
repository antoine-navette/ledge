type Props = {
    code: string;
};

// Only transient errors are worth trying again, by reloading the whole app which runs everything again from the start
const RETRYABLE_CODES = ['NETWORK_ERROR', 'INTERNAL_SERVER_ERROR', 'TOO_MANY_REQUESTS'];

const ErrorPage = ({ code }: Props) => {
    return (
        <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-4 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Something went wrong</h1>
            <p className="text-red-600">{code}</p>

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
    );
};

export default ErrorPage;
