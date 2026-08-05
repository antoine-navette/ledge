import { useState } from 'react';
import { TransactionService } from '../services/TransactionService';
import type { Transaction } from '../entities/Transaction';
import Modal from './Modal.tsx';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
    onDelete: (transaction: Transaction) => void;
}

const DeleteTransactionModal = ({ isOpen, onClose, transaction, onDelete }: Props) => {
    const [state, setState] = useState<
        { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string }
    >({ status: 'idle' });

    const handleDelete = async () => {
        setState({ status: 'loading' });

        const { error } = await TransactionService.deleteById(transaction.id);
        if (error) {
            setState({ status: 'error', message: error.code });
            return;
        }

        onDelete(transaction);
    };

    if (!isOpen) return;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete transaction">
            <p className="mb-6 text-gray-600">
                Are you sure you want to delete <strong>{transaction.name}</strong> ({transaction.value} €)?
                <br />
                <span className="text-xs text-red-500">This action cannot be undone.</span>
            </p>

            {state.status === 'error' && (
                <p className="text-sm text-red-500 mb-4 bg-red-50 p-2 rounded text-center">{state.message}</p>
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
