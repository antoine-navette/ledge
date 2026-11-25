import { useState } from 'react';
import { deleteTransaction } from '../services/transaction.ts';
import type { Transaction } from '../entities/Transaction';
import Modal from '../components/Modal.tsx';
import { ERROR_MESSAGES, type ErrorCode } from '../constants/errors.ts';

interface Props {
    onClose: () => void;
    transaction: Transaction;
    onDelete: (transaction: Transaction) => void;
}

const DeleteTransactionModal = ({ onClose, transaction, onDelete }: Props) => {
    const [state, setState] = useState<
        { status: 'idle' } | { status: 'loading' } | { status: 'error'; code: ErrorCode }
    >({ status: 'idle' });

    const handleDelete = async () => {
        setState({ status: 'loading' });

        const code = await deleteTransaction(transaction.id);
        if (code) {
            setState({ status: 'error', code });
            return;
        }

        onDelete(transaction);
        onClose();
    };

    return (
        <Modal onClose={onClose} title="Delete transaction">
            <p className="mb-6 text-gray-600">
                Are you sure you want to delete <strong>{transaction.name}</strong> ({transaction.value} €)?
                <br />
                <span className="text-xs text-red-500">This action cannot be undone.</span>
            </p>

            {state.status === 'error' && (
                <p className="text-sm text-red-500 mb-4 bg-red-50 p-2 rounded text-center">
                    {ERROR_MESSAGES[state.code]}
                </p>
            )}

            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-4 py-2 text-sm shadow-sm cursor-pointer transition select-none font-medium"
                    disabled={state.status === 'loading'}
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm shadow cursor-pointer transition select-none font-medium"
                    disabled={state.status === 'loading'}
                >
                    {state.status === 'loading' ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </Modal>
    );
};

export default DeleteTransactionModal;
