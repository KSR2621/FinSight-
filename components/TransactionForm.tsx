
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import { XMarkIcon } from './icons';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onEdit: (transaction: Transaction) => void;
  transactionToEdit: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose, onAdd, onEdit, transactionToEdit }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description);
      setAmount(String(transactionToEdit.amount));
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date);
    } else {
      // Reset form
      setDescription('');
      setAmount('');
      setType(TransactionType.EXPENSE);
      setCategory(Category.FOOD);
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transactionToEdit, isOpen]);

  useEffect(() => {
    // Update category list when type changes
    if (type === TransactionType.INCOME) {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
    };
    if (transactionToEdit) {
      onEdit({ ...transactionData, id: transactionToEdit.id });
    } else {
      onAdd(transactionData);
    }
  };

  if (!isOpen) return null;

  const categoryOptions = type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card dark:bg-gray-800 rounded-lg p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">{transactionToEdit ? 'Edit' : 'Add'} Transaction</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <XMarkIcon className="h-6 w-6"/>
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required 
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01"
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Type</label>
            <select value={type} onChange={e => setType(e.target.value as TransactionType)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-card dark:bg-gray-700">
              <option value={TransactionType.EXPENSE}>Expense</option>
              <option value={TransactionType.INCOME}>Income</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as Category)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-card dark:bg-gray-700">
              {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-card dark:bg-gray-700" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-indigo-700">{transactionToEdit ? 'Save Changes' : 'Add Transaction'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
