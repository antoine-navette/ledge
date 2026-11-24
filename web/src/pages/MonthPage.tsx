import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TransactionListSection from '../components/TransactionListSection.tsx';
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

    // Empty until the month is loaded: only shown on success anyway
    const transactions = state.status === 'success' ? state.transactions : [];
    const incomes = transactions.filter((t) => t.type === 'income').sort((a, b) => b.value - a.value);
    const expenses = transactions.filter((t) => t.type === 'expense').sort((a, b) => b.value - a.value);
    const totalIncomes = incomes.reduce((acc, t) => acc + t.value, 0);
    const totalExpenses = expenses.reduce((acc, t) => acc + t.value, 0);
    const total = totalIncomes - totalExpenses;

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
                    <>
                        <div className="w-full max-w-5xl bg-white shadow-md rounded-lg p-4 mb-6 text-center">
                            <h3 className="text-xl font-semibold text-gray-800 select-none">Total balance</h3>
                            <p
                                className={`text-2xl font-bold select-none ${total > 0 ? 'text-green-900' : total < 0 ? 'text-red-900' : 'text-black'}`}
                            >
                                {total.toFixed(2)} €
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                            <TransactionListSection
                                transactions={incomes}
                                total={totalIncomes}
                                year={year}
                                month={month}
                                type="income"
                                onUpsert={handleUpsert}
                                onDelete={handleDelete}
                            />
                            <TransactionListSection
                                transactions={expenses}
                                total={totalExpenses}
                                year={year}
                                month={month}
                                type="expense"
                                onUpsert={handleUpsert}
                                onDelete={handleDelete}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default MonthPage;
