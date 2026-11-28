import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CircleCheck, Pencil, Trash2, X } from 'lucide-react';
import DateNavigator from '../components/DateNavigator';
import UpsertTransactionModal from '../modals/UpsertTransactionModal.tsx';
import DeleteTransactionModal from '../modals/DeleteTransactionModal.tsx';
import { getUserTransactions } from '../services/transaction.ts';
import type { Transaction } from '../entities/Transaction';
import type { CalendarDate } from '../entities/CalendarDate.ts';
import ErrorPage from './ErrorPage.tsx';
import { ERROR_MESSAGES, type ErrorCode } from '../constants/errors.ts';

// Built and read in UTC, so that no time zone shifts the day
const formatDate = (date: CalendarDate) =>
    new Date(Date.UTC(date.year, date.month - 1, date.day)).toLocaleDateString('en-UK', { timeZone: 'UTC' });

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
        | { status: 'upsert'; type: Transaction['kind']['type']; transaction: Transaction | null }
        | { status: 'delete'; transaction: Transaction }
    >({ status: 'closed' });

    // Off on each load, so that the full month stays the default view. Kept from one month to the next, since the page
    // stays mounted, to compare months without investments
    const [hideInvestments, setHideInvestments] = useState(false);

    // A short confirmation of the last action. A new one replaces it, rather than piling up
    // The transaction is shown whole, enough to spot a typo in the value or the day
    const [toast, setToast] = useState<{
        id: number;
        action: 'added' | 'updated' | 'deleted';
        transaction: Transaction;
    } | null>(null);

    useEffect(() => {
        if (!toast) return;

        const timeout = setTimeout(() => setToast(null), 6000);
        return () => clearTimeout(timeout);
    }, [toast]);

    useEffect(() => {
        let ignore = false; // Permet d'ignorer les réponses des anciennes requêtes lorsque l'on change de page trop vite

        const fetchData = async () => {
            setState({ status: 'loading' });

            const [transactions, code] = await getUserTransactions(year, month);
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
        const isUpdate = state.status === 'success' && state.transactions.some((t) => t.id === transaction.id);
        setToast({ id: Date.now(), action: isUpdate ? 'updated' : 'added', transaction });

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
        setToast({ id: Date.now(), action: 'deleted', transaction });

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
    const incomes = transactions.filter((t) => t.kind.type === 'income').sort((a, b) => b.value - a.value);
    const expenses = transactions
        .filter((t) => t.kind.type === 'expense' && !(hideInvestments && t.kind.category === 'investment'))
        .sort((a, b) => b.value - a.value);
    const totalIncomes = incomes.reduce((acc, t) => acc + t.value, 0);
    const totalExpenses = expenses.reduce((acc, t) => acc + t.value, 0);
    const total = totalIncomes - totalExpenses;

    return (
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

                                        {section.type === 'expense' && (
                                            <label className="flex items-center justify-end gap-2 mb-3 text-sm text-gray-600 cursor-pointer select-none">
                                                Hide investments
                                                <input
                                                    type="checkbox"
                                                    checked={hideInvestments}
                                                    onChange={(e) => setHideInvestments(e.target.checked)}
                                                    className="cursor-pointer"
                                                />
                                            </label>
                                        )}

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
                                                                    {formatDate(transaction.date)}
                                                                </p>
                                                            </div>

                                                            <div className="flex flex-col items-end">
                                                                <p className={`font-bold ${styles.value} select-none`}>
                                                                    {styles.sign} {transaction.value} €
                                                                </p>

                                                                {transaction.kind.type === 'expense' &&
                                                                    transaction.kind.category && (
                                                                        <span
                                                                            className={`text-xs px-2 py-0.5 rounded-full mt-1 capitalize select-none font-medium ${
                                                                                transaction.kind.category === 'need'
                                                                                    ? 'bg-blue-100 text-blue-700'
                                                                                    : transaction.kind.category ===
                                                                                        'want'
                                                                                      ? 'bg-red-100 text-red-700'
                                                                                      : 'bg-green-100 text-green-700'
                                                                            }`}
                                                                        >
                                                                            {transaction.kind.category}
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-gray-50">
                                                            <button
                                                                onClick={() =>
                                                                    setModal({
                                                                        status: 'upsert',
                                                                        type: transaction.kind.type,
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

            {/* Always rendered, so that screen readers announce each new message without moving the focus */}
            <div role="status" className="fixed bottom-4 inset-x-4 flex justify-center pointer-events-none">
                {toast && (
                    <div
                        key={toast.id}
                        className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm select-none pointer-events-auto"
                    >
                        <CircleCheck size={18} className="text-green-600 shrink-0" />
                        <div>
                            <p className="text-gray-800">
                                {toast.action === 'added'
                                    ? 'Added'
                                    : toast.action === 'updated'
                                      ? 'Updated'
                                      : 'Deleted'}{' '}
                                <span className="font-medium">{toast.transaction.name}</span>
                            </p>
                            <p className="text-gray-500">
                                <span
                                    className={
                                        toast.transaction.kind.type === 'income' ? 'text-green-700' : 'text-red-700'
                                    }
                                >
                                    {toast.transaction.kind.type === 'income' ? '+' : '-'} {toast.transaction.value} €
                                </span>{' '}
                                on {formatDate(toast.transaction.date)}
                                {/* Same badge as in the list, so the category can be checked without looking for the
                                    transaction there */}
                                {toast.transaction.kind.type === 'expense' && toast.transaction.kind.category && (
                                    <span
                                        className={`ml-2 text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                                            toast.transaction.kind.category === 'need'
                                                ? 'bg-blue-100 text-blue-700'
                                                : toast.transaction.kind.category === 'want'
                                                  ? 'bg-red-100 text-red-700'
                                                  : 'bg-green-100 text-green-700'
                                        }`}
                                    >
                                        {toast.transaction.kind.category}
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer shrink-0"
                            aria-label="Dismiss"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthPage;
