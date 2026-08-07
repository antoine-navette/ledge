import type { Transaction } from '../entities/Transaction';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import UpsertTransactionModal from './UpsertTransactionModal.tsx';
import DeleteTransactionModal from './DeleteTransactionModal.tsx';

interface Props {
    transactions: Transaction[];
    total: number;
    month: string;
    type: 'income' | 'expense';
    onUpsert: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
}

const TransactionListSection = ({ transactions, total, month, type, onUpsert, onDelete }: Props) => {
    const [modal, setModal] = useState<
        | { status: 'closed' }
        | { status: 'upsert'; transaction: Transaction | null }
        | { status: 'delete'; transaction: Transaction }
    >({ status: 'closed' });

    const bgColor = type === 'income' ? 'bg-green-50' : 'bg-red-50';
    const titleColor = type === 'income' ? 'text-green-700' : 'text-red-700';
    const totalColor = type === 'income' ? 'text-green-800' : 'text-red-800';
    const valueColor = type === 'income' ? 'text-green-700' : 'text-red-700';
    const buttonBgColor = type === 'income' ? 'bg-green-600' : 'bg-red-600';
    const hoverButtonBgColor = type === 'income' ? 'hover:bg-green-700' : 'hover:bg-red-700';

    return (
        <div className="flex flex-col gap-3">
            {modal.status === 'upsert' && (
                <UpsertTransactionModal
                    onClose={() => setModal({ status: 'closed' })}
                    transaction={modal.transaction}
                    type={type}
                    month={month}
                    onUpsert={onUpsert}
                />
            )}

            {modal.status === 'delete' && (
                <DeleteTransactionModal
                    onClose={() => setModal({ status: 'closed' })}
                    transaction={modal.transaction}
                    onDelete={onDelete}
                />
            )}

            <button
                onClick={() => setModal({ status: 'upsert', transaction: null })}
                className={`${buttonBgColor} ${hoverButtonBgColor} text-white rounded-md px-4 py-3 text-sm shadow cursor-pointer transition select-none font-semibold flex items-center justify-center gap-2 capitalize`}
            >
                + {type}
            </button>

            <div className={`${bgColor} rounded-lg p-4 shadow-md flex flex-col transition-all`}>
                <div className="flex justify-between items-end mb-4 border-b pb-2 border-black/5">
                    <h3 className={`text-lg font-bold ${titleColor} select-none`}>
                        {type === 'income' ? 'Incomes' : 'Expenses'}
                    </h3>
                    <p className={`font-semibold ${totalColor} select-none`}>{total.toFixed(2)} €</p>
                </div>

                <div className="flex flex-col gap-2">
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="bg-white p-3 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-gray-800 font-medium select-none">{transaction.name}</h4>

                                        <p className="text-gray-400 text-xs mt-0.5 select-none">
                                            {new Date(transaction.createdAt).toLocaleString('en-UK')}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <p className={`font-bold ${valueColor} select-none`}>
                                            {type === 'income' ? '+' : '-'} {transaction.value} €
                                        </p>

                                        {transaction.type === 'expense' && transaction.category && (
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full mt-1 capitalize select-none font-medium
                                            ${
                                                transaction.category === 'need'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : transaction.category === 'want'
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
                                        onClick={() => setModal({ status: 'upsert', transaction })}
                                        className="text-gray-400 hover:text-blue-600 transition cursor-pointer p-1"
                                        aria-label="Edit"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => setModal({ status: 'delete', transaction })}
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
                            No {type} for this month.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionListSection;
