import type { Transaction } from '../entities/Transaction';
import TransactionListSection from './TransactionListSection.tsx';

interface Props {
    transactions: Transaction[];
    year: number;
    month: number;
    onUpsert: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
}

const TransactionsOverview = ({ transactions, year, month, onUpsert, onDelete }: Props) => {
    const incomes = transactions.filter((t) => t.type === 'income');
    const expenses = transactions.filter((t) => t.type === 'expense');
    const totalIncomes = incomes.reduce((acc, t) => acc + t.value, 0);
    const totalExpenses = expenses.reduce((acc, t) => acc + t.value, 0);
    const total = totalIncomes - totalExpenses;

    return (
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
                    onUpsert={onUpsert}
                    onDelete={onDelete}
                />
                <TransactionListSection
                    transactions={expenses}
                    total={totalExpenses}
                    year={year}
                    month={month}
                    type="expense"
                    onUpsert={onUpsert}
                    onDelete={onDelete}
                />
            </div>
        </>
    );
};

export default TransactionsOverview;
