import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, Category, TransactionType, Currency, CURRENCY_SYMBOLS } from '../types';
import { PencilIcon, TrashIcon, ArrowDownTrayIcon, ChevronDownIcon } from './icons';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  currency: Currency;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  currency,
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
        setIsDownloadDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [downloadDropdownRef]);

  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const handleDownloadCSV = (period: '30d' | '90d' | '1y' | '3y' | '5y' | 'all') => {
    setIsDownloadDropdownOpen(false);

    const today = new Date();
    let startDate = new Date(0); // Epoch for 'all'

    if (period !== 'all') {
        const tempDate = new Date();
        tempDate.setHours(0, 0, 0, 0); // Start from the beginning of the day

        switch (period) {
            case '30d':
                tempDate.setDate(today.getDate() - 30);
                break;
            case '90d':
                tempDate.setDate(today.getDate() - 90);
                break;
            case '1y':
                tempDate.setFullYear(today.getFullYear() - 1);
                break;
            case '3y':
                tempDate.setFullYear(today.getFullYear() - 3);
                break;
            case '5y':
                tempDate.setFullYear(today.getFullYear() - 5);
                break;
        }
        startDate = tempDate;
    }

    const transactionsToDownload = transactions.filter(t => new Date(t.date) >= startDate);

    if (transactionsToDownload.length === 0) {
      alert(`No transactions to download for the selected period.`);
      return;
    }

    const headers = ["ID", "Description", "Amount", "Type", "Category", "Date"];
    const csvRows = [headers.join(',')];

    for (const t of transactionsToDownload) {
      const values = [
        t.id,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        t.category,
        t.date
      ];
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `finsight-transactions-${period}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  const renderDropdownItem = (period: '30d' | '90d' | '1y' | '3y' | '5y' | 'all', label: string) => (
      <li className="text-sm text-text-primary dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md">
        <button
          onClick={() => handleDownloadCSV(period)}
          className="w-full text-left px-4 py-2"
        >
          {label}
        </button>
      </li>
  );

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
          <div className="relative" ref={downloadDropdownRef}>
            <button
              onClick={() => setIsDownloadDropdownOpen(prev => !prev)}
              className="flex items-center justify-center gap-1.5 px-3 h-10 bg-secondary text-white rounded-md hover:bg-green-700 transition-colors flex-shrink-0"
              aria-haspopup="true"
              aria-expanded={isDownloadDropdownOpen}
              aria-label="Open download options"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isDownloadDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDownloadDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card dark:bg-gray-700 rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5 p-1">
                <ul className="space-y-1">
                  {renderDropdownItem('30d', 'Last 30 Days')}
                  {renderDropdownItem('90d', 'Last 90 Days')}
                  {renderDropdownItem('1y', 'Last 1 Year')}
                  {renderDropdownItem('3y', 'Last 3 Years')}
                  {renderDropdownItem('5y', 'Last 5 Years')}
                  <li className="border-t border-gray-200 dark:border-gray-600 my-1"></li>
                  {renderDropdownItem('all', 'All Time')}
                </ul>
              </div>
            )}
          </div>
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