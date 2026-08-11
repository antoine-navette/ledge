import { useState, FormEvent } from 'react';
import { TransactionService } from '../services/TransactionService';
import type { Transaction } from '../entities/Transaction';
import Modal from './Modal.tsx';

interface Props {
    onClose: () => void;
    transaction: Transaction | null;
    type: 'income' | 'expense';
    year: number;
    month: number;
    onUpsert: (transaction: Transaction) => void;
}

const UpsertTransactionModal = ({ onClose, transaction, type, year, month, onUpsert }: Props) => {
    const [state, setState] = useState<
        { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string }
    >({ status: 'idle' });

    // TODO: clean
    const monthStr = String(month).padStart(2, '0');
    const minDate = `${year}-${monthStr}-01`;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const maxDateOfMonth = `${year}-${monthStr}-${String(lastDayOfMonth).padStart(2, '0')}`;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const maxDate = today < maxDateOfMonth ? today : maxDateOfMonth;

    const [form, setForm] = useState({
        name: transaction ? transaction.name : '',
        value: transaction ? String(transaction.value) : '',
        category: transaction ? transaction.category : undefined,
        date: transaction ? transaction.date.slice(0, 10) : '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setState({ status: 'loading' });

        const { data, error } = transaction
            ? await TransactionService.updateById(
                  transaction.id,
                  form.name,
                  Number(form.value),
                  type,
                  form.category,
                  form.date,
              )
            : await TransactionService.create(form.name, Number(form.value), type, form.category, form.date);
        if (error) {
            setState({ status: 'error', message: error.code });
            return;
        }

        onUpsert(data);
        onClose();
    };

    return (
        <Modal onClose={onClose} title={transaction ? `Edit ${type}` : `Add ${type}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        className="block text-sm font-medium mb-1 text-gray-700 cursor-pointer select-none"
                        htmlFor="name"
                    >
                        Name
                    </label>
                    <input
                        id="name"
                        autoFocus
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300"
                        required
                        maxLength={99}
                    />
                </div>

                <div>
                    <label
                        className="block text-sm font-medium mb-1 text-gray-700 cursor-pointer select-none"
                        htmlFor="date"
                    >
                        Date
                    </label>
                    <input
                        id="date"
                        type="date"
                        min={minDate}
                        max={maxDate}
                        value={form.date}
                        onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300"
                        required
                    />
                </div>

                <div>
                    <label
                        className="block text-sm font-medium mb-1 text-gray-700 cursor-pointer select-none"
                        htmlFor="value"
                    >
                        Value (€)
                    </label>
                    <input
                        id="value"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0.01"
                        max="999999999.99"
                        value={form.value}
                        onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300"
                        required
                    />
                </div>

                {type === 'expense' && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium mb-2 text-gray-700 select-none">Category</label>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                key="need"
                                type="button"
                                onClick={() =>
                                    setForm((prev) => ({
                                        ...prev,
                                        category: prev.category === 'need' ? undefined : ('need' as const),
                                    }))
                                }
                                className={`px-3 py-1 rounded-full text-white text-sm cursor-pointer transition select-none bg-blue-500
                                            ${form.category === 'need' ? 'opacity-100 ring-2 ring-offset-1 ring-gray-300' : 'opacity-40 hover:opacity-70'}
                                        `}
                            >
                                Need
                            </button>
                            <button
                                key="want"
                                type="button"
                                onClick={() =>
                                    setForm((prev) => ({
                                        ...prev,
                                        category: prev.category === 'want' ? undefined : ('want' as const),
                                    }))
                                }
                                className={`px-3 py-1 rounded-full text-white text-sm cursor-pointer transition select-none bg-red-500
                                            ${form.category === 'want' ? 'opacity-100 ring-2 ring-offset-1 ring-gray-300' : 'opacity-40 hover:opacity-70'}
                                        `}
                            >
                                Want
                            </button>
                            <button
                                key="investment"
                                type="button"
                                onClick={() =>
                                    setForm((prev) => ({
                                        ...prev,
                                        category: prev.category === 'investment' ? undefined : ('investment' as const),
                                    }))
                                }
                                className={`px-3 py-1 rounded-full text-white text-sm cursor-pointer transition select-none bg-green-500
                                            ${form.category === 'investment' ? 'opacity-100 ring-2 ring-offset-1 ring-gray-300' : 'opacity-40 hover:opacity-70'}
                                        `}
                            >
                                Investment
                            </button>
                        </div>
                    </div>
                )}

                {state.status === 'error' && (
                    <div className="p-3 rounded bg-red-50 text-red-600 text-sm text-center border border-red-100">
                        {state.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={state.status === 'loading'}
                    className={`w-full text-white font-semibold px-4 py-2 rounded text-sm disabled:opacity-50 cursor-pointer transition select-none bg-blue-600 hover:bg-blue-700
                        `}
                >
                    {state.status === 'loading' ? 'Saving...' : transaction ? 'Update' : 'Add'}
                </button>
            </form>
        </Modal>
    );
};

export default UpsertTransactionModal;
