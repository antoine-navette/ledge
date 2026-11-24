import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import DateNavigator from '../components/DateNavigator';
import UpsertTransactionModal from '../modals/UpsertTransactionModal.tsx';
import DeleteTransactionModal from '../modals/DeleteTransactionModal.tsx';
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

    // One modal at a time for the whole page. A new transaction needs its type, an existing one already has it
    const [modal, setModal] = useState<
        | { status: 'closed' }
        | { status: 'upsert'; type: Transaction['type']; transaction: Transaction | null }
        | { status: 'delete'; transaction: Transaction }
    >({ status: 'closed' });

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
                            {(
                                [
                                    {
                                        type: 'income',
                                        transactions: incomes,
                                        total: totalIncomes,
                                        // Full class names, so that Tailwind finds them in the code
                                        styles: {
                                            title: 'Incomes',
                                            background: 'bg-green-50',
                                            heading: 'text-green-700',
                                            total: 'text-green-800',
                                            value: 'text-green-700',
                                            button: 'bg-green-600 hover:bg-green-700',
                                            sign: '+',
                                        },
                                    },
                                    {
                                        type: 'expense',
                                        transactions: expenses,
                                        total: totalExpenses,
                                        styles: {
                                            title: 'Expenses',
                                            background: 'bg-red-50',
                                            heading: 'text-red-700',
                                            total: 'text-red-800',
                                            value: 'text-red-700',
                                            button: 'bg-red-600 hover:bg-red-700',
                                            sign: '-',
                                        },
                                    },
                                ] as const
                            ).map((section) => {
                                const { styles } = section;

                                return (
                                    <div key={section.type} className="flex flex-col gap-3">
                                        <button
                                            onClick={() =>
                                                setModal({ status: 'upsert', type: section.type, transaction: null })
                                            }
                                            className={`${styles.button} text-white rounded-md px-4 py-3 text-sm shadow cursor-pointer transition select-none font-semibold flex items-center justify-center gap-2 capitalize`}
                                        >
                                            + {section.type}
                                        </button>

                                        <div
                                            className={`${styles.background} rounded-lg p-4 shadow-md flex flex-col transition-all`}
                                        >
                                            <div className="flex justify-between items-end mb-4 border-b pb-2 border-black/5">
                                                <h3 className={`text-lg font-bold ${styles.heading} select-none`}>
                                                    {styles.title}
                                                </h3>
                                                <p className={`font-semibold ${styles.total} select-none`}>
                                                    {section.total.toFixed(2)} €
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {section.transactions.length > 0 ? (
                                                    section.transactions.map((transaction) => (
                                                        <div
                                                            key={transaction.id}
                                                            className="bg-white p-3 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="text-gray-800 font-medium select-none">
                                                                        {transaction.name}
                                                                    </h4>

                                                                    <p className="text-gray-400 text-xs mt-0.5 select-none">
                                                                        {transaction.date.toLocaleDateString('en-UK', {
                                                                            timeZone: 'UTC',
                                                                        })}
                                                                    </p>
                                                                </div>

                                                                <div className="flex flex-col items-end">
                                                                    <p
                                                                        className={`font-bold ${styles.value} select-none`}
                                                                    >
                                                                        {styles.sign} {transaction.value} €
                                                                    </p>

                                                                    {transaction.type === 'expense' &&
                                                                        transaction.category && (
                                                                            <span
                                                                                className={`text-xs px-2 py-0.5 rounded-full mt-1 capitalize select-none font-medium ${
                                                                                    transaction.category === 'need'
                                                                                        ? 'bg-blue-100 text-blue-700'
                                                                                        : transaction.category ===
                                                                                            'want'
                                                                                          ? 'bg-red-100 text-red-700'
                                                                                          : 'bg-green-100 text-green-700'
                                                                                }`}
                                                                            >
                                                                                {transaction.category}
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-gray-50">
                                                                <button
                                                                    onClick={() =>
                                                                        setModal({
                                                                            status: 'upsert',
                                                                            type: transaction.type,
                                                                            transaction,
                                                                        })
                                                                    }
                                                                    className="text-gray-400 hover:text-blue-600 transition cursor-pointer p-1"
                                                                    aria-label="Edit"
                                                                >
                                                                    <Pencil size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        setModal({ status: 'delete', transaction })
                                                                    }
                                                                    className="text-gray-400 hover:text-red-600 transition cursor-pointer p-1"
                                                                    aria-label="Delete"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-400 text-sm text-center italic py-4 select-none">
                                                        No {section.type} for this month.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {modal.status === 'upsert' && (
                            <UpsertTransactionModal
                                onClose={() => setModal({ status: 'closed' })}
                                transaction={modal.transaction}
                                type={modal.type}
                                year={year}
                                month={month}
                                onUpsert={handleUpsert}
                            />
                        )}

                        {modal.status === 'delete' && (
                            <DeleteTransactionModal
                                onClose={() => setModal({ status: 'closed' })}
                                transaction={modal.transaction}
                                onDelete={handleDelete}
                            />
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default MonthPage;
