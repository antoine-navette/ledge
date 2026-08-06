import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TransactionsOverview from '../components/TransactionsOverview.tsx';
import DateNavigator from '../components/DateNavigator';
import { TransactionService } from '../services/TransactionService';
import type { Transaction } from '../entities/Transaction';

const Month = () => {
    const navigate = useNavigate();
    const { month } = useParams();

    const [state, setState] = useState<
        | { status: 'loading' }
        | { status: 'success'; transactions: Transaction[] }
        | { status: 'error'; message: string }
    >({ status: 'loading' });

    useEffect(() => {
        let ignore = false; // Permet d'ignorer les réponses des anciennes requêtes lorsque l'on change de page trop vite

        const fetchData = async () => {
            if (!month) return; // Théoriquement inutile, mais gardé au cas où

            setState({ status: 'loading' });

            const { data, error } = await TransactionService.read({ month });
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
    }, [month]);

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

    const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!month || !regex.test(month)) return <Navigate to="/" replace />;

    const [yearStr, monthStr] = month.split('-');
    const label = `${monthStr}/${yearStr}`;
    const todayStr = new Date().toISOString().slice(0, 7);

    const navigateToMonthOffset = (offset: number) => {
        const [y, m] = month.split('-').map(Number);
        const date = new Date(y, m - 1 + offset);
        date.setDate(15);
        navigate(`/month/${date.toISOString().slice(0, 7)}`);
    };

    return (
        <>
            <Navbar />

            <div className="flex flex-col flex-1 items-center p-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 select-none">Ledge</h1>

                <DateNavigator
                    label={label}
                    onPrev={() => navigateToMonthOffset(-1)}
                    onNext={() => navigateToMonthOffset(1)}
                    onToday={() => navigate(`/month/${todayStr}`)}
                    isCurrent={month === todayStr}
                />

                {state.status === 'loading' && <p className="text-gray-500 select-none">Loading...</p>}

                {state.status === 'error' && <p className="text-red-600 select-none">{state.message}</p>}

                {state.status === 'success' && (
                    <TransactionsOverview
                        transactions={state.transactions}
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
