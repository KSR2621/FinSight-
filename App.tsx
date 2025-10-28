import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category, Currency } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import AiChatbot from './components/AiChatbot';
import AiContentAnalyzer from './components/AiContentAnalyzer';

interface AppProps {
  onLogout: () => void;
}

const App: React.FC<AppProps> = ({ onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('currency') as Currency) || 'USD';
  });

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error("Could not save transactions to localStorage", error);
    }
  }, [transactions]);

  // Save dark mode preference to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);
  
  // Save currency preference to localStorage
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);


  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsFormModalOpen(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    setEditingTransaction(null);
    setIsFormModalOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormModalOpen(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 font-sans">
      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        onLogout={onLogout}
        currency={currency}
        onCurrencyChange={setCurrency}
        onAddTransaction={openAddModal}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Dashboard transactions={transactions} currency={currency} />
        
        <AiContentAnalyzer />

        <div className="mt-8">
          <TransactionList
            transactions={transactions}
            onEditTransaction={openEditModal}
            onDeleteTransaction={handleDeleteTransaction}
            currency={currency}
          />
        </div>
      </main>

      {isFormModalOpen && (
        <TransactionForm
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onAdd={handleAddTransaction}
          onEdit={handleEditTransaction}
          transactionToEdit={editingTransaction}
        />
      )}

      <AiChatbot transactions={transactions} />
    </div>
  );
};

export default App;