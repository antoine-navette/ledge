import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TransactionsOverview from '../components/TransactionsOverview.tsx';
import DateNavigator from '../components/DateNavigator';
import { TransactionService } from '../services/TransactionService';
import type { Transaction } from '../entities/Transaction';

const Month = () => {
    const navigate = useNavigate();
    const params = useParams();

    const year = Number(params.year);
    const month = Number(params.month);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [state, setState] = useState<
        | { status: 'loading' }
        | { status: 'success'; transactions: Transaction[] }
        | { status: 'error'; message: string }
    >({ status: 'loading' });

    useEffect(() => {
        let ignore = false; // Permet d'ignorer les réponses des anciennes requêtes lorsque l'on change de page trop vite

        const fetchData = async () => {
            setState({ status: 'loading' });

            // TODO: clean
            const from = `${year}-${String(month).padStart(2, '0')}-01`;
            const [nextYear, nextMonth] = month === 12 ? [year + 1, 1] : [year, month + 1];
            const to = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

            const { data, error } = await TransactionService.read({ from, to });
            if (ignore) return;
            if (error) {
                setState({ status: 'error', message: error.code });
                return;
            }

            setState({ status: 'success', transactions: data });
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

    if (!Number.isInteger(year) || year < 1970 || year > currentYear) {
        return <Navigate to="/" replace />;
    }

    if (!Number.isInteger(month) || month < 1 || month > 12 || (year === currentYear && month > currentMonth)) {
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

                {state.status === 'error' && <p className="text-red-600 select-none">{state.message}</p>}

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

export default Month;
