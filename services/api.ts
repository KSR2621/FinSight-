import { Transaction, Budget, Goal, Bill, PortfolioAsset, FinancialHealthScore } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  GOALS: 'goals',
  BILLS: 'bills',
  PORTFOLIO: 'portfolio',
};

// Helper for user-scoped keys
const getScopedKey = (userId: string, key: string) => `finsight_${userId}_${key}`;

const getLocal = <T>(userId: string, key: string): T[] => {
  try {
    const fullKey = getScopedKey(userId, key);
    const data = localStorage.getItem(fullKey);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const setLocal = (userId: string, key: string, data: any) => {
  try {
    const fullKey = getScopedKey(userId, key);
    localStorage.setItem(fullKey, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
};

export const api = {
  // Transactions
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    return getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
  },

  addTransaction: async (userId: string, t: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) } as Transaction;
    const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
    setLocal(userId, STORAGE_KEYS.TRANSACTIONS, [...current, newTransaction]);
    return newTransaction;
  },

  updateTransaction: async (userId: string, id: string, t: Partial<Transaction>): Promise<Transaction> => {
    const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
    const updated = current.map(item => item.id === id ? { ...item, ...t } : item);
    setLocal(userId, STORAGE_KEYS.TRANSACTIONS, updated);
    return updated.find(item => item.id === id) as Transaction;
  },

  deleteTransaction: async (userId: string, id: string): Promise<void> => {
    const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
    setLocal(userId, STORAGE_KEYS.TRANSACTIONS, current.filter(item => item.id !== id));
  },

  // AI Features
  getForecast: async (history: Transaction[]): Promise<any> => {
    // Forecast is simulated since we don't have a backend anymore
    const forecast = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      amount: 100 + Math.random() * 50
    }));
    return { forecast };
  },

  getHealthScore: async (): Promise<FinancialHealthScore> => {
    return {
      score: 0,
      breakdown: {
        savings: 0,
        spending: 0,
        investments: 0,
        debt: 0
      },
      suggestions: [
        "Add transactions to see your financial health score.",
        "Set up budgets to track your spending habits.",
        "Add savings goals to plan for your future."
      ]
    };
  },

  // Budgets
  getBudgets: async (userId: string): Promise<Budget[]> => {
    return getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
  },

  addBudget: async (userId: string, b: Omit<Budget, 'id'>): Promise<Budget> => {
    const newBudget = { ...b, id: Math.random().toString(36).substr(2, 9) } as Budget;
    const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
    setLocal(userId, STORAGE_KEYS.BUDGETS, [...current, newBudget]);
    return newBudget;
  },

  updateBudget: async (userId: string, id: string, b: Partial<Budget>): Promise<Budget> => {
    const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
    const updated = current.map(item => item.id === id ? { ...item, ...b } : item);
    setLocal(userId, STORAGE_KEYS.BUDGETS, updated);
    return updated.find(item => item.id === id) as Budget;
  },

  deleteBudget: async (userId: string, id: string): Promise<void> => {
    const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
    setLocal(userId, STORAGE_KEYS.BUDGETS, current.filter(item => item.id !== id));
  },

  // Goals
  getGoals: async (userId: string): Promise<Goal[]> => {
    return getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
  },

  addGoal: async (userId: string, g: Omit<Goal, 'id'>): Promise<Goal> => {
    const newGoal = { ...g, id: Math.random().toString(36).substr(2, 9) } as Goal;
    const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
    setLocal(userId, STORAGE_KEYS.GOALS, [...current, newGoal]);
    return newGoal;
  },

  updateGoal: async (userId: string, id: string, g: Partial<Goal>): Promise<Goal> => {
    const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
    const updated = current.map(item => item.id === id ? { ...item, ...g } : item);
    setLocal(userId, STORAGE_KEYS.GOALS, updated);
    return updated.find(item => item.id === id) as Goal;
  },

  deleteGoal: async (userId: string, id: string): Promise<void> => {
    const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
    setLocal(userId, STORAGE_KEYS.GOALS, current.filter(item => item.id !== id));
  },

  // Bills
  getBills: async (userId: string): Promise<Bill[]> => {
    return getLocal<Bill>(userId, STORAGE_KEYS.BILLS);
  },

  // Portfolio
  getPortfolio: async (userId: string): Promise<PortfolioAsset[]> => {
    return getLocal<PortfolioAsset>(userId, STORAGE_KEYS.PORTFOLIO);
  }
};
