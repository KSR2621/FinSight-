
import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType, Currency, CURRENCY_SYMBOLS } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from './icons';

interface TransactionListProps {
  transactions: Transaction[];
  onAddTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  currency: Currency;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  currency,
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        const categoryMatch = filter === 'All' || t.category === filter || t.type === filter;
        const searchMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
    });
  }, [transactions, filter, searchTerm]);

  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats);
  }, [transactions]);

  const currencySymbol = CURRENCY_SYMBOLS[currency];

  return (
    <div className="bg-card dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <h3 className="text-lg font-semibold text-text-primary dark:text-white">Recent Transactions</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="All">All</option>
            <optgroup label="Types">
                <option value={TransactionType.INCOME}>Income</option>
                <option value={TransactionType.EXPENSE}>Expense</option>
            </optgroup>
            <optgroup label="Categories">
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          </select>
          <button
            onClick={onAddTransaction}
            className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors flex-shrink-0"
            aria-label="Add new transaction"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-2 px-4 font-semibold text-text-secondary dark:text-gray-400">Description</th>
              <th className="py-2 px-4 font-semibold text-text-secondary dark:text-gray-400">Category</th>
              <th className="py-2 px-4 font-semibold text-text-secondary dark:text-gray-400">Date</th>
              <th className="py-2 px-4 font-semibold text-text-secondary dark:text-gray-400 text-right">Amount</th>
              <th className="py-2 px-4 font-semibold text-text-secondary dark:text-gray-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => (
              <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-4 text-text-primary dark:text-white">{t.description}</td>
                <td className="py-3 px-4 text-text-secondary dark:text-gray-300">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">{t.category}</span>
                </td>
                <td className="py-3 px-4 text-text-secondary dark:text-gray-300">{new Date(t.date).toLocaleDateString()}</td>
                <td className={`py-3 px-4 font-semibold text-right ${t.type === 'Income' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.type === 'Income' ? '+' : '-'}{currencySymbol}{t.amount.toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEditTransaction(t)} className="text-gray-500 hover:text-primary dark:hover:text-primary-dark">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDeleteTransaction(t.id)} className="text-gray-500 hover:text-red-500">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-text-secondary dark:text-gray-400">
                No transactions found. Add one to get started!
            </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
