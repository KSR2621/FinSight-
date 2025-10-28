
import { Transaction, Category, TransactionType } from './types';

export const EXPENSE_CATEGORIES: Category[] = [
  Category.FOOD,
  Category.TRAVEL,
  Category.SHOPPING,
  Category.UTILITIES,
  Category.ENTERTAINMENT,
  Category.HEALTH,
  Category.OTHER,
];

export const INCOME_CATEGORIES: Category[] = [
  Category.SALARY,
  Category.FREELANCE,
  Category.INVESTMENTS,
  Category.OTHER,
];

export const generateInitialTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Add an income transaction every 15 days
    if (i % 15 === 0) {
      transactions.push({
        id: `income-${i}-${Date.now()}`,
        description: 'Monthly Salary',
        amount: 5000,
        type: TransactionType.INCOME,
        category: Category.SALARY,
        date: dateString,
      });
    }

    // Add some random expenses
    if (i % 3 === 0) {
      transactions.push({
        id: `exp-food-${i}-${Date.now()}`,
        description: 'Groceries',
        amount: Math.random() * 50 + 20,
        type: TransactionType.EXPENSE,
        category: Category.FOOD,
        date: dateString,
      });
    }

    if (i % 5 === 0) {
      transactions.push({
        id: `exp-travel-${i}-${Date.now()}`,
        description: 'Gasoline',
        amount: Math.random() * 30 + 15,
        type: TransactionType.EXPENSE,
        category: Category.TRAVEL,
        date: dateString,
      });
    }

    if (i % 7 === 0) {
       transactions.push({
        id: `exp-ent-${i}-${Date.now()}`,
        description: 'Movie Tickets',
        amount: Math.random() * 25 + 10,
        type: TransactionType.EXPENSE,
        category: Category.ENTERTAINMENT,
        date: dateString,
      });
    }

    transactions.push({
      id: `exp-coffee-${i}-${Date.now()}`,
      description: 'Morning Coffee',
      amount: Math.random() * 5 + 3,
      type: TransactionType.EXPENSE,
      category: Category.FOOD,
      date: dateString,
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
