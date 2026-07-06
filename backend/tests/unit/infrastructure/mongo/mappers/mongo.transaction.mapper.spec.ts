import { describe, expect, it } from 'vitest';
import { fakeTransaction } from '../../../../fakes/transaction.js';
import { MongoTransactionMapper } from '../../../../../src/infrastructure/mongo/mappers/mongo.transaction.mapper.js';
import { ObjectId } from 'mongodb';

describe('MongoTransactionMapper', () => {
    describe('toDocument', () => {
        it('should map an EXPENSE transaction to a document correctly', () => {
            const expense = fakeTransaction({ type: 'expense', expenseCategory: 'need' });
            const document = MongoTransactionMapper.toDocument(expense);

            expect(document._id).toBeInstanceOf(ObjectId);
            expect(document._id.toString()).toBe(expense.id);
            expect(document.userId).toBeInstanceOf(ObjectId);
            expect(document.userId.toString()).toBe(expense.userId);

            expect(document).toHaveProperty('expenseCategory', expense.expenseCategory);
            expect(document.type).toBe('expense');
        });

        it('should map an INCOME transaction to a document correctly', () => {
            const income = fakeTransaction({ id: '607f1f77bcf86cd799439012', type: 'income', expenseCategory: null });

            const document = MongoTransactionMapper.toDocument(income);

            expect(document._id.toString()).toBe(income.id);
            expect(document.type).toBe('income');

            expect(document).not.toHaveProperty('expenseCategory');
        });

        it('should throw an error when providing an invalid ID format', () => {
            const transaction = fakeTransaction({ id: 'invalid-id' });
            expect(() => MongoTransactionMapper.toDocument(transaction)).toThrow();
        });
    });

    describe('toEntity', () => {
        it('should map an EXPENSE document back to a domain entity (Round-trip)', () => {
            const originalExpense = fakeTransaction({ type: 'expense', expenseCategory: 'need' });
            const document = MongoTransactionMapper.toDocument(originalExpense);

            const result = MongoTransactionMapper.toEntity(document);

            expect(result).toEqual(originalExpense);
        });

        it('should map an INCOME document back to a domain entity (Round-trip)', () => {
            const originalIncome = fakeTransaction({
                id: '607f1f77bcf86cd799439012',
                type: 'income',
                expenseCategory: null,
            });
            const document = MongoTransactionMapper.toDocument(originalIncome);

            const result = MongoTransactionMapper.toEntity(document);

            expect(result).toEqual(originalIncome);
            expect(result.expenseCategory).toBeNull();
        });

        it('should map an EXPENSE document without category back to null (handling optional field)', () => {
            const expenseWithNullCategory = fakeTransaction({ type: 'expense', expenseCategory: null });
            const document = MongoTransactionMapper.toDocument(expenseWithNullCategory);

            expect(document).not.toHaveProperty('expenseCategory');

            const result = MongoTransactionMapper.toEntity(document);

            expect(result.type).toBe('expense');
            expect(result.expenseCategory).toBeNull();
            expect(result).toEqual(expenseWithNullCategory);
        });
    });
});
