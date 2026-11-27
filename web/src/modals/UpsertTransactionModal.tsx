import { useState, FormEvent } from 'react';
import { createTransaction, updateTransaction } from '../services/transaction.ts';
import type { Transaction } from '../entities/Transaction';
import Modal from '../components/Modal.tsx';
import { ERROR_MESSAGES, type ErrorCode } from '../constants/errors.ts';

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
        { status: 'idle' } | { status: 'loading' } | { status: 'error'; code: ErrorCode }
    >({ status: 'idle' });

    // The page sets the year and the month, so only the day is chosen: up to the last day of the month (day 0 of the
    // next one), or today in the current month. Read in local time, which is the user's
    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    const lastDay = isCurrentMonth ? now.getDate() : new Date(year, month, 0).getDate();
    const days = Array.from({ length: lastDay }, (_, index) => index + 1);

    const [form, setForm] = useState({
        name: transaction ? transaction.name : '',
        value: transaction ? String(transaction.value) : '',
        category: transaction ? transaction.category : null,
        day: transaction ? String(transaction.date.day) : '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setState({ status: 'loading' });

        const date = { year, month, day: Number(form.day) };
        // The API refuses surrounding spaces, which mobile keyboards often add after the last word
        const name = form.name.trim();
        const value = Number(form.value);
        const [upserted, code] = transaction
            ? await updateTransaction(transaction.id, name, value, type, form.category, date)
            : await createTransaction(name, value, type, form.category, date);
        if (code) {
            setState({ status: 'error', code });
            return;
        }

        onUpsert(upserted);
        onClose();
    };

    return (
        <Modal onClose={onClose} title={transaction ? `Edit ${type}` : `Add ${type}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        className="block text-sm font-medium mb-1 text-gray-700 cursor-pointer select-none"
                        htmlFor="day"
                    >
                        Day
                    </label>
                    <select
                        id="day"
                        value={form.day}
                        onChange={(e) => setForm((prev) => ({ ...prev, day: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300"
                        required
                    >
                        <option value="" disabled>
                            Select a day
                        </option>
                        {days.map((day) => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>
                </div>

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
                        // At least one visible character, so a name made of spaces only is refused before sending
                        pattern=".*\S.*"
                        maxLength={99}
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
                        // A text input, since a number input lets letters through and can't limit the decimals as
                        // they are typed. Mobile keyboards still show digits
                        type="text"
                        inputMode="decimal"
                        value={form.value}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Digits only, with a dot and at most 2 decimals. 9 digits before it keep the value within
                            // the API's maximum (999999999.99). Any other keystroke is ignored
                            if (!/^\d{0,9}(\.\d{0,2})?$/.test(value)) return;
                            setForm((prev) => ({ ...prev, value }));
                        }}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300"
                        required
                        // At least one non-zero digit, so that 0 is refused before sending (the minimum is 0.01)
                        pattern=".*[1-9].*"
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
                                        category: prev.category === 'need' ? null : ('need' as const),
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
                                        category: prev.category === 'want' ? null : ('want' as const),
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
                                        category: prev.category === 'investment' ? null : ('investment' as const),
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
                        {ERROR_MESSAGES[state.code]}
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
