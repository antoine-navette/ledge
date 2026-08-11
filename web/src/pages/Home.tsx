import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DateNavigator from '../components/DateNavigator';

const Home = () => {
    const navigate = useNavigate();
    const params = useParams();

    const year = Number(params.year);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (!Number.isInteger(year) || year < 1970 || year > new Date().getFullYear()) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col flex-1 items-center justify-center p-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 select-none">Ledge</h1>

                <DateNavigator
                    label={String(year)}
                    onPrev={() => navigate(`/${year - 1}`)}
                    onToday={() => navigate(`/${currentYear}`)}
                    onNext={() => navigate(`/${year + 1}`)}
                    isPrevDisabled={year === 1970}
                    isTodayDisabled={year === currentYear}
                    isNextDisabled={year === currentYear}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                        const monthString = String(month).padStart(2, '0');

                        if (year === currentYear && month > currentMonth) {
                            return (
                                <div
                                    key={month}
                                    aria-disabled="true"
                                    className="rounded-lg p-6 w-full h-24 flex items-center justify-center text-center font-medium shadow-sm select-none border bg-gray-50 border-gray-200 text-gray-400"
                                >
                                    {monthString}/{year}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={month}
                                to={`/${year}/${monthString}`}
                                className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                            >
                                <div
                                    className={`rounded-lg p-6 w-full h-24 flex items-center justify-center text-center font-medium transition shadow-sm select-none border ${
                                        year === currentYear && month === currentMonth
                                            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                                    }`}
                                >
                                    {monthString}/{year}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Home;
