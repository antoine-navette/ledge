import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TransactionsOverview from '../components/TransactionsOverview.tsx';
import DateNavigator from '../components/DateNavigator';
import { getUserTransactions } from '../services/transaction.ts';
import type { Transaction } from '../entities/Transaction';
import ErrorPage from './ErrorPage.tsx';
import { ERROR_MESSAGES, type ErrorCode } from '../constants/errors.ts';

const MonthPage = () => {
    const navigate = useNavigate();
    const params = useParams();

    const year = Number(params.year);
    const month = Number(params.month);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [state, setState] = useState<
        | { status: 'loading' }
        | { status: 'success'; transactions: Transaction[] }
        | { status: 'error'; code: ErrorCode }
    >({ status: 'loading' });

    useEffect(() => {
        let ignore = false; // Permet d'ignorer les réponses des anciennes requêtes lorsque l'on change de page trop vite

        const fetchData = async () => {
            setState({ status: 'loading' });

            // TODO: clean
            // Calendar days at midnight UTC, like transaction dates: day 0 of the next month is the last of this one
            const from = new Date(Date.UTC(year, month - 1, 1));
            const to = new Date(Date.UTC(year, month, 0));

            const [transactions, code] = await getUserTransactions(from, to);
            if (ignore) return;
            if (code) {
                setState({ status: 'error', code });
                return;
            }

            setState({ status: 'success', transactions });
        };

        void fetchData();

        return () => {
            ignore = true;
        };
    }, [year, month]);

    const handleUpsert = (transaction: Transaction) => {
        setState((prev) => {
            if (prev.status !== 'success') return prev;

            return {
                status: 'success',
                transactions: prev.transactions.find((t) => t.id === transaction.id)
                    ? prev.transactions.map((t) => (t.id === transaction.id ? transaction : t))
                    : [...prev.transactions, transaction],
            };
        });
    };

    const handleDelete = (transaction: Transaction) => {
        setState((prev) => {
            if (prev.status !== 'success') return prev;

            return { status: 'success', transactions: prev.transactions.filter((t) => t.id !== transaction.id) };
        });
    };

    // Not a date at all: this page doesn't exist. A real date out of range is a plausible navigation instead
    if (!/^\d{4}$/.test(params.year ?? '') || !/^\d{1,2}$/.test(params.month ?? '') || month < 1 || month > 12) {
        return <ErrorPage code="ROUTE_NOT_FOUND" />;
    }

    if (year < 1970 || year > currentYear) {
        return <Navigate to="/" replace />;
    }

    if (year === currentYear && month > currentMonth) {
        return <Navigate to={`/${year}`} replace />;
    }

    const goToPreviousMonth = () => {
        if (month === 1) navigate(`/${year - 1}/12`);
        else navigate(`/${year}/${String(month - 1).padStart(2, '0')}`);
    };

    const goToNextMonth = () => {
        if (month === 12) navigate(`/${year + 1}/01`);
        else navigate(`/${year}/${String(month + 1).padStart(2, '0')}`);
    };

    return (
        <>
            <Navbar />

            <div className="flex flex-col flex-1 items-center p-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 select-none">Ledge</h1>

                <DateNavigator
                    label={`${String(month).padStart(2, '0')}/${year}`}
                    onPrev={goToPreviousMonth}
                    onToday={() => navigate(`/${currentYear}/${String(currentMonth).padStart(2, '0')}`)}
                    onNext={goToNextMonth}
                    isPrevDisabled={year === 1970 && month === 1}
                    isTodayDisabled={year === currentYear && month === currentMonth}
                    isNextDisabled={year === currentYear && month === currentMonth}
                />

                {state.status === 'loading' && <p className="text-gray-500 select-none">Loading...</p>}

                {state.status === 'error' && <p className="text-red-600 select-none">{ERROR_MESSAGES[state.code]}</p>}

                {state.status === 'success' && (
                    <TransactionsOverview
                        transactions={state.transactions}
                        year={year}
                        month={month}
                        onUpsert={handleUpsert}
                        onDelete={handleDelete}
                    />
                )}
            </div>
        </>
    );
};

export default MonthPage;
