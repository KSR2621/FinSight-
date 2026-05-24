import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Transaction, Currency, User } from './types';
import Header from './components/Header';
import TransactionForm from './components/TransactionForm';
import { api } from './services/api';
import { RefreshIcon, PlusIcon } from './components/icons';
import { motion, AnimatePresence } from 'motion/react';

// Import Pages
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import WealthHorizonPage from './pages/WealthHorizonPage';
import BudgetsGoalsPage from './pages/BudgetsGoalsPage';
import NewsPage from './pages/NewsPage';
import InsightsPage from './pages/InsightsPage';
import AiChatbot from './components/AiChatbot';

interface AppProps {
  user: User;
  onLogout: () => void;
}

const App: React.FC<AppProps> = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currency, setCurrency] = useState<Currency>('USD');
  
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const balance = transactions.reduce((acc, t) => acc + (t.type === 'Income' ? t.amount : -t.amount), 0);

  const loadUserData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      setSyncError(null);

      const trans = await api.getTransactions(user.uid);

      // Load preferences from local storage directly
      const prefsJSON = localStorage.getItem(`finsight_preferences_${user.uid}`);
      if (prefsJSON) {
        try {
          const prefs = JSON.parse(prefsJSON);
          setIsDarkMode(!!prefs.isDarkMode);
          if (prefs.currency) setCurrency(prefs.currency);
        } catch (prefError) {
          console.warn("Failed to parse preferences from localStorage", prefError);
        }
      }

      if (Array.isArray(trans)) {
        setTransactions(trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }

    } catch (e) {
      console.error("Failed to load user data", e);
      setSyncError("Live sync unavailable. Using offline data.");
    } finally {
      setIsLoadingData(false);
    }
  }, [user.uid]);

  // Effect to load all user data on initial mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (!isLoadingData && user) {
        localStorage.setItem(`finsight_preferences_${user.uid}`, JSON.stringify({ isDarkMode, currency }));
    }
  }, [isDarkMode, currency, user, isLoadingData]);


  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    await api.addTransaction(user.uid, transaction);
    await loadUserData();
    setIsFormModalOpen(false);
  };

  const handleEditTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      await api.updateTransaction(user.uid, editingTransaction.id, transactionData);
      await loadUserData();
      setEditingTransaction(null);
      setIsFormModalOpen(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    await api.deleteTransaction(user.uid, id);
    await loadUserData();
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
    setIsDarkMode(prev => !prev);
  };
  
  if (isLoadingData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <RefreshIcon className="animate-spin h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-text-primary dark:text-white">Loading your data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 font-sans">
      <AnimatePresence>
        {syncError && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 backdrop-blur-md"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-bold tracking-tight">{syncError}</span>
            <button
              onClick={() => setSyncError(null)}
              className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <PlusIcon className="w-4 h-4 rotate-45" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Header 
        user={user}
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        currency={currency}
        onCurrencyChange={setCurrency}
        onAddTransaction={openAddModal}
        onLogout={onLogout}
      />

      <main className="max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/transactions" replace />} />
          <Route path="/dashboard" element={<DashboardPage transactions={transactions} currency={currency} user={user} />} />
          <Route path="/transactions" element={<TransactionsPage currency={currency} user={user} />} />
          <Route path="/budgets" element={<BudgetsGoalsPage currency={currency} transactions={transactions} user={user} />} />
          <Route path="/horizon" element={<WealthHorizonPage transactions={transactions} currency={currency} />} />
          <Route path="/insights" element={<InsightsPage transactions={transactions} currency={currency} />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <AiChatbot transactions={transactions} currency={currency} balance={balance} />

      {/* Global Transaction Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-2xl relative my-auto"
            >
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-text-primary dark:text-white">
                  {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
                </h2>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <PlusIcon className="w-6 h-6 rotate-45 text-gray-400" />
                </button>
              </div>
              <TransactionForm
                onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                currency={currency}
                initialData={editingTransaction}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
