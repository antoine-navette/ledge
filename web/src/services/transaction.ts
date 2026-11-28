import { http } from '../config/http.ts';
import type { Transaction } from '../entities/Transaction.ts';
import type { CalendarDate } from '../entities/CalendarDate.ts';
import { TransactionMapper } from '../mappers/TransactionMapper.ts';

export const createTransaction = async (name: string, value: number, kind: Transaction['kind'], date: CalendarDate) => {
    const response = await http
        .POST('/transactions', {
            body: { name, value, kind, date },
        })
        .catch(() => null);
    if (!response) return [null, 'NETWORK_ERROR'] as const;
    if (response.error) return [null, response.error.code] as const;

    return [TransactionMapper.toEntity(response.data), null] as const;
};

export const getUserTransactions = async (year: number, month: number) => {
    const response = await http.GET('/transactions', { params: { query: { year, month } } }).catch(() => null);
    if (!response) return [null, 'NETWORK_ERROR'] as const;
    if (response.error) return [null, response.error.code] as const;

    return [response.data.map(TransactionMapper.toEntity), null] as const;
};

export const getTransaction = async (id: Transaction['id']) => {
    const response = await http.GET('/transactions/{id}', { params: { path: { id } } }).catch(() => null);
    if (!response) return [null, 'NETWORK_ERROR'] as const;
    if (response.error) return [null, response.error.code] as const;

    return [TransactionMapper.toEntity(response.data), null] as const;
};

export const updateTransaction = async (
    id: Transaction['id'],
    name: string,
    value: number,
    kind: Transaction['kind'],
    date: CalendarDate,
) => {
    const response = await http
        .PUT('/transactions/{id}', {
            params: { path: { id } },
            body: { name, value, kind, date },
        })
        .catch(() => null);
    if (!response) return [null, 'NETWORK_ERROR'] as const;
    if (response.error) return [null, response.error.code] as const;

    return [TransactionMapper.toEntity(response.data), null] as const;
};

export const deleteTransaction = async (id: Transaction['id']) => {
    const response = await http.DELETE('/transactions/{id}', { params: { path: { id } } }).catch(() => null);
    if (!response) return 'NETWORK_ERROR' as const;
    if (response.error) return response.error.code;

    return null;
};
