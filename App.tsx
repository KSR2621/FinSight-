
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category } from './types';
import { generateInitialTransactions } from './constants';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import AiChatbot from './components/AiChatbot';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(generateInitialTransactions());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Dashboard transactions={transactions} />
        
        <div className="mt-8">
          <TransactionList
            transactions={transactions}
            onAddTransaction={openAddModal}
            onEditTransaction={openEditModal}
            onDeleteTransaction={handleDeleteTransaction}
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
