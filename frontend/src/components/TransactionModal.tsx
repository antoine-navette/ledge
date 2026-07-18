import { useEffect, useState, FormEvent } from 'react';
import { TransactionService } from '../services/TransactionService';
import type { Transaction } from '../entities/Transaction';
import Modal from './Modal.tsx';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialTransaction: Transaction | null;
    defaultType: 'income' | 'expense';
    month: string;
    onSave: (transaction: Transaction) => void;
}

const TransactionModal = ({ isOpen, onClose, initialTransaction, defaultType, month, onSave }: Props) => {
    const [fixedType, setFixedType] = useState<'income' | 'expense'>(defaultType);

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [category, setCategory] = useState<'need' | 'want' | 'investment' | null>(null);

    const [globalError, setGlobalError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setGlobalError(null);
            setIsLoading(false);

            if (initialTransaction) {
                setName(initialTransaction.name);
                setValue(String(initialTransaction.value));
                setCategory(initialTransaction.category ?? null);
                setFixedType(initialTransaction.type);
            } else {
                setName('');
                setValue('');
                setCategory(null);
                setFixedType(defaultType);
            }
        }
    }, [isOpen, initialTransaction, defaultType]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setGlobalError(null);

        const numValue = Number(value);

        const { data, error } = initialTransaction
            ? await TransactionService.update(initialTransaction.id, name, numValue, fixedType, category ?? undefined)
            : await TransactionService.create(month, name, numValue, fixedType, category ?? undefined);

        setIsLoading(false);

        if (error) {
            setGlobalError(error.code);
            return;
        }

        onSave(data);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialTransaction ? `Edit ${fixedType}` : `Add ${fixedType}`}>
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300"
                        required
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
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0.01"
                        max="999999999.99"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300"
                        required
                    />
                </div>

                {fixedType === 'expense' && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium mb-2 text-gray-700 select-none">Category</label>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                key="need"
                                type="button"
                                onClick={() => setCategory(category === 'need' ? null : 'need')}
                                className={`px-3 py-1 rounded-full text-white text-sm cursor-pointer transition select-none bg-blue-500
                                            ${category === 'need' ? 'opacity-100 ring-2 ring-offset-1 ring-gray-300' : 'opacity-40 hover:opacity-70'}
                                        `}
                            >
                                Need
                            </button>
                            <button
                                key="want"
                                type="button"
                                onClick={() => setCategory(category === 'want' ? null : 'want')}
                                className={`px-3 py-1 rounded-full text-white text-sm cursor-pointer transition select-none bg-red-500
                                            ${category === 'want' ? 'opacity-100 ring-2 ring-offset-1 ring-gray-300' : 'opacity-40 hover:opacity-70'}
                                        `}
                            >
                                Want
                            </button>
                            <button
                                key="investment"
                                type="button"
                                onClick={() => setCategory(category === 'investment' ? null : 'investment')}
                                className={`px-3 py-1 rounded-full text-white text-sm cursor-pointer transition select-none bg-green-500
                                            ${category === 'investment' ? 'opacity-100 ring-2 ring-offset-1 ring-gray-300' : 'opacity-40 hover:opacity-70'}
                                        `}
                            >
                                Investment
                            </button>
                        </div>
                    </div>
                )}

                {globalError && (
                    <div className="p-3 rounded bg-red-50 text-red-600 text-sm text-center border border-red-100">
                        {globalError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white font-semibold px-4 py-2 rounded text-sm disabled:opacity-50 cursor-pointer transition select-none bg-blue-600 hover:bg-blue-700
                        `}
                >
                    {isLoading ? 'Saving...' : initialTransaction ? 'Update' : 'Add'}
                </button>
            </form>
        </Modal>
    );
};

export default TransactionModal;
