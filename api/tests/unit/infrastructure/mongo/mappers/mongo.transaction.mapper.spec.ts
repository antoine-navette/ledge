import { describe, expect, it } from 'vitest';
import { fakeTransaction } from '../../../../fakes/transaction.js';
import { MongoTransactionMapper } from '../../../../../src/infrastructure/mongo/mappers/mongo.transaction.mapper.js';
import { ObjectId } from 'mongodb';

describe('MongoTransactionMapper', () => {
    describe('toDocument', () => {
        it('should map an EXPENSE transaction to a document correctly', () => {
            const expense = fakeTransaction({ type: 'expense', category: 'need' });
            const document = MongoTransactionMapper.toDocument(expense);

            expect(document._id).toBeInstanceOf(ObjectId);
            expect(document._id.toString()).toBe(expense.id);
            expect(document.userId).toBeInstanceOf(ObjectId);
            expect(document.userId.toString()).toBe(expense.userId);

            expect(document).toHaveProperty('category', expense.category);
            expect(document.type).toBe('expense');
        });

        it('should map an INCOME transaction to a document correctly', () => {
            const income = fakeTransaction({ id: '607f1f77bcf86cd799439012', type: 'income' });

            const document = MongoTransactionMapper.toDocument(income);

            expect(document._id.toString()).toBe(income.id);
            expect(document.type).toBe('income');

            expect(document).not.toHaveProperty('category');
        });

        it('should throw an error when providing an invalid ID format', () => {
            const transaction = fakeTransaction({ id: 'invalid-id' });
            expect(() => MongoTransactionMapper.toDocument(transaction)).toThrow();
        });
    });

    describe('toEntity', () => {
        it('should map an EXPENSE document back to a domain entity (Round-trip)', () => {
            const originalExpense = fakeTransaction({ type: 'expense', category: 'need' });
            const document = MongoTransactionMapper.toDocument(originalExpense);

            const result = MongoTransactionMapper.toEntity(document);

            expect(result).toEqual(originalExpense);
        });

        it('should map an INCOME document back to a domain entity (Round-trip)', () => {
            const originalIncome = fakeTransaction({
                id: '607f1f77bcf86cd799439012',
                type: 'income',
            });
            const document = MongoTransactionMapper.toDocument(originalIncome);

            const result = MongoTransactionMapper.toEntity(document);

            expect(result).toEqual(originalIncome);
            expect(result.category).toBeUndefined();
        });

        it('should map an EXPENSE document without category back to undefined (handling optional field)', () => {
            const expenseWithoutCategory = fakeTransaction({ type: 'expense' });
            const document = MongoTransactionMapper.toDocument(expenseWithoutCategory);

            expect(document).not.toHaveProperty('category');

            const result = MongoTransactionMapper.toEntity(document);

            expect(result.type).toBe('expense');
            expect(result.category).toBeUndefined();
            expect(result).toEqual(expenseWithoutCategory);
        });
    });
});
