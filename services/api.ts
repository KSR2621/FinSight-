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

const getAuthToken = () => localStorage.getItem('finsight_token');

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 204) return null;

  if (!response.ok) {
    let errorMessage = 'API request failed';
    try {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        if (errorText && errorText.length < 200) {
          errorMessage = errorText;
        }
      }
    } catch (e) {
      // Fallback
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }
};

const API_BASE = '/api';

export const api = {
  // Transactions
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    try {
      return await fetchWithAuth(`${API_BASE}/transactions`);
    } catch (e) {
      console.warn("Using offline transactions", e);
      return getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
    }
  },

  addTransaction: async (userId: string, t: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      const newTransaction = await fetchWithAuth(`${API_BASE}/transactions`, {
        method: 'POST',
        body: JSON.stringify(t),
      });
      return newTransaction;
    } catch (e) {
      const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) } as Transaction;
      const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
      setLocal(userId, STORAGE_KEYS.TRANSACTIONS, [...current, newTransaction]);
      return newTransaction;
    }
  },

  updateTransaction: async (userId: string, id: string, t: Partial<Transaction>): Promise<Transaction> => {
    try {
      return await fetchWithAuth(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(t),
      });
    } catch (e) {
      const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
      const updated = current.map(item => item.id === id ? { ...item, ...t } : item);
      setLocal(userId, STORAGE_KEYS.TRANSACTIONS, updated);
      return updated.find(item => item.id === id) as Transaction;
    }
  },

  deleteTransaction: async (userId: string, id: string): Promise<void> => {
    try {
      await fetchWithAuth(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
      setLocal(userId, STORAGE_KEYS.TRANSACTIONS, current.filter(item => item.id !== id));
    }
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

  getHealthScore: async (userId: string): Promise<FinancialHealthScore> => {
    let transactions, budgets, portfolio;
    try {
      [transactions, budgets, portfolio] = await Promise.all([
        api.getTransactions(userId),
        api.getBudgets(userId),
        api.getPortfolio(userId)
      ]);
    } catch (e) {
      transactions = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
      budgets = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
      portfolio = getLocal<PortfolioAsset>(userId, STORAGE_KEYS.PORTFOLIO);
    }

    const now = new Date();
    const last30Days = transactions.filter(t => {
      const tDate = new Date(t.date);
      return (now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
    });

    const income = last30Days.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = last30Days.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const cashBalance = transactions.reduce((sum, t) => t.type === 'Income' ? sum + t.amount : sum - t.amount, 0);
    const portfolioValue = portfolio.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
    const netWorth = cashBalance + portfolioValue;

    // 1. Savings Score (0-100) - Target 20% savings rate
    const savingsRate = income > 0 ? Math.max(0, (income - expenses) / income) : 0;
    const savingsScore = Math.min(100, Math.round((savingsRate / 0.2) * 100));

    // 2. Spending Score (0-100) - Based on budget adherence
    let spendingScore = 100;
    if (budgets.length > 0) {
      let totalBudgeted = 0;
      let totalSpentInBudgetCategories = 0;

      budgets.forEach(b => {
        totalBudgeted += b.amount;
        totalSpentInBudgetCategories += last30Days
          .filter(t => t.category === b.category && t.type === 'Expense')
          .reduce((sum, t) => sum + t.amount, 0);
      });

      if (totalBudgeted > 0) {
        spendingScore = Math.max(0, Math.round(100 - (Math.max(0, totalSpentInBudgetCategories - totalBudgeted) / totalBudgeted * 100)));
      }
    } else if (expenses > 0 && income > 0) {
        spendingScore = Math.min(100, Math.round(Math.max(0, 1 - (expenses / income)) * 100));
    }

    // 3. Investment Score (0-100) - Target 30% of Net Worth in investments
    const investmentRatio = netWorth > 0 ? portfolioValue / netWorth : 0;
    const investmentScore = Math.min(100, Math.round((investmentRatio / 0.3) * 100));

    // 4. Emergency Fund Score (0-100) - Target 3 months of expenses
    const monthlyExpenses = expenses || 1; // avoid division by zero
    const runwayMonths = Math.max(0, cashBalance / monthlyExpenses);
    const debtScore = Math.min(100, Math.round((runwayMonths / 3) * 100));

    const totalScore = Math.round((savingsScore + spendingScore + investmentScore + debtScore) / 4);

    const suggestions = [];
    if (savingsScore < 50) suggestions.push("Try to increase your savings rate to at least 20% of your income.");
    if (spendingScore < 70) suggestions.push("You're exceeding your budgets. Review your discretionary spending.");
    if (investmentScore < 40) suggestions.push("Consider diversifying your wealth by increasing your investment portfolio.");
    if (debtScore < 60) suggestions.push("Work on building an emergency fund that covers at least 3 months of expenses.");
    if (suggestions.length === 0) suggestions.push("Your financial health is excellent! Keep maintaining these habits.");

    return {
      score: totalScore,
      breakdown: {
        savings: savingsScore,
        spending: spendingScore,
        investments: investmentScore,
        debt: debtScore
      },
      suggestions
    };
  },

  // Budgets
  getBudgets: async (userId: string): Promise<Budget[]> => {
    try {
      return await fetchWithAuth(`${API_BASE}/budgets`);
    } catch (e) {
      return getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
    }
  },

  addBudget: async (userId: string, b: Omit<Budget, 'id'>): Promise<Budget> => {
    try {
      return await fetchWithAuth(`${API_BASE}/budgets`, {
        method: 'POST',
        body: JSON.stringify(b),
      });
    } catch (e) {
      const newBudget = { ...b, id: Math.random().toString(36).substr(2, 9) } as Budget;
      const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
      setLocal(userId, STORAGE_KEYS.BUDGETS, [...current, newBudget]);
      return newBudget;
    }
  },

  updateBudget: async (userId: string, id: string, b: Partial<Budget>): Promise<Budget> => {
    try {
      return await fetchWithAuth(`${API_BASE}/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(b),
      });
    } catch (e) {
      const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
      const updated = current.map(item => item.id === id ? { ...item, ...b } : item);
      setLocal(userId, STORAGE_KEYS.BUDGETS, updated);
      return updated.find(item => item.id === id) as Budget;
    }
  },

  deleteBudget: async (userId: string, id: string): Promise<void> => {
    try {
      await fetchWithAuth(`${API_BASE}/budgets/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
      setLocal(userId, STORAGE_KEYS.BUDGETS, current.filter(item => item.id !== id));
    }
  },

  // Goals
  getGoals: async (userId: string): Promise<Goal[]> => {
    try {
      return await fetchWithAuth(`${API_BASE}/goals`);
    } catch (e) {
      return getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
    }
  },

  addGoal: async (userId: string, g: Omit<Goal, 'id'>): Promise<Goal> => {
    try {
      return await fetchWithAuth(`${API_BASE}/goals`, {
        method: 'POST',
        body: JSON.stringify(g),
      });
    } catch (e) {
      const newGoal = { ...g, id: Math.random().toString(36).substr(2, 9) } as Goal;
      const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
      setLocal(userId, STORAGE_KEYS.GOALS, [...current, newGoal]);
      return newGoal;
    }
  },

  updateGoal: async (userId: string, id: string, g: Partial<Goal>): Promise<Goal> => {
    try {
      return await fetchWithAuth(`${API_BASE}/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(g),
      });
    } catch (e) {
      const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
      const updated = current.map(item => item.id === id ? { ...item, ...g } : item);
      setLocal(userId, STORAGE_KEYS.GOALS, updated);
      return updated.find(item => item.id === id) as Goal;
    }
  },

  deleteGoal: async (userId: string, id: string): Promise<void> => {
    try {
      await fetchWithAuth(`${API_BASE}/goals/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
      setLocal(userId, STORAGE_KEYS.GOALS, current.filter(item => item.id !== id));
    }
  },

  // Bills
  getBills: async (userId: string): Promise<Bill[]> => {
    try {
      return await fetchWithAuth(`${API_BASE}/bills`);
    } catch (e) {
      return getLocal<Bill>(userId, STORAGE_KEYS.BILLS);
    }
  },

  // Portfolio
  getPortfolio: async (userId: string): Promise<PortfolioAsset[]> => {
    try {
      return await fetchWithAuth(`${API_BASE}/portfolio`);
    } catch (e) {
      return getLocal<PortfolioAsset>(userId, STORAGE_KEYS.PORTFOLIO);
    }
  }
};
