import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category, Currency, CURRENCY_SYMBOLS } from '../types';
import { aiService } from '../services/aiService';
import { SparklesIcon } from './icons';

interface TransactionFormProps {
  onSubmit: (t: Omit<Transaction, 'id'>) => void;
  currency: Currency;
  initialData?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, currency, initialData }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [isSplit, setIsSplit] = useState(false);
  const [splitCount, setSplitCount] = useState('2');
  const [isAiCategorizing, setIsAiCategorizing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(String(initialData.amount));
      setType(initialData.type);
      setCategory(initialData.category);
      setDate(initialData.date);
      setNotes(initialData.notes || '');
      setIsRecurring(!!initialData.isRecurring);
      setRecurringInterval(initialData.recurringFrequency || 'monthly');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onSubmit({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
      notes,
      isRecurring,
      recurringFrequency: isRecurring ? recurringInterval : undefined,
      isSplit,
      splitCount: isSplit ? parseInt(splitCount) : undefined
    });
  };

  const handleAiCategorize = async () => {
    if (!description.trim()) return;
    setIsAiCategorizing(true);
    try {
      const suggestedCategory = await aiService.categorizeTransaction(description);
      setCategory(suggestedCategory);
    } catch (error) {
      console.error("AI categorization failed", error);
    } finally {
      setIsAiCategorizing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-1.5 md:space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] md:text-xs font-mono text-text-secondary dark:text-gray-400 uppercase tracking-widest ml-1">Description</label>
            {description.length > 3 && (
              <button
                type="button"
                onClick={handleAiCategorize}
                disabled={isAiCategorizing}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                <SparklesIcon className={`w-3 h-3 ${isAiCategorizing ? 'animate-spin' : ''}`} />
                {isAiCategorizing ? '...' : 'AI Categorize'}
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="e.g. Grocery Shopping"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm md:text-base"
            required
          />
        </div>
        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] md:text-xs font-mono text-text-secondary dark:text-gray-400 uppercase tracking-widest ml-1">Amount ({CURRENCY_SYMBOLS[currency]})</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-mono text-sm md:text-base"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] md:text-xs font-mono text-text-secondary dark:text-gray-400 uppercase tracking-widest ml-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm md:text-base"
          >
            <option value={TransactionType.INCOME}>Income</option>
            <option value={TransactionType.EXPENSE}>Expense</option>
          </select>
        </div>
        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] md:text-xs font-mono text-text-secondary dark:text-gray-400 uppercase tracking-widest ml-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm md:text-base"
          >
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 md:space-y-2 col-span-2 md:col-span-1">
          <label className="text-[10px] md:text-xs font-mono text-text-secondary dark:text-gray-400 uppercase tracking-widest ml-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-mono text-sm md:text-base"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <label className="text-[10px] md:text-xs font-mono text-text-secondary dark:text-gray-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
        <textarea
          placeholder="Add any additional details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 md:px-5 md:py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none h-20 md:h-24 text-sm md:text-base"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="flex items-center justify-between p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 gap-4">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 md:w-5 md:h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="recurring" className="text-xs md:text-sm font-bold text-text-primary dark:text-white cursor-pointer">Recurring</label>
          </div>
          {isRecurring && (
            <select
              value={recurringInterval}
              onChange={(e) => setRecurringInterval(e.target.value as any)}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-xs md:text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>

        <div className="flex items-center justify-between p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 gap-4">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="split"
              checked={isSplit}
              onChange={(e) => setIsSplit(e.target.checked)}
              className="w-4 h-4 md:w-5 md:h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="split" className="text-xs md:text-sm font-bold text-text-primary dark:text-white cursor-pointer">Split</label>
          </div>
          {isSplit && (
            <div className="flex items-center gap-2">
              <input 
                type="number"
                min="2"
                value={splitCount}
                onChange={(e) => setSplitCount(e.target.value)}
                className="w-12 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-xs md:text-sm font-mono text-center"
              />
              <span className="text-[10px] font-mono text-text-secondary dark:text-gray-400 uppercase tracking-widest">Ppl</span>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
      >
        {initialData ? 'Update Transaction' : 'Save Transaction'}
      </button>
    </form>
  );
};

export default TransactionForm;
