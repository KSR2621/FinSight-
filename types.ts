
export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export enum Category {
  FOOD = 'Food',
  TRAVEL = 'Travel',
  SHOPPING = 'Shopping',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  HEALTH = 'Health',
  SALARY = 'Salary',
  FREELANCE = 'Freelance',
  INVESTMENTS = 'Investments',
  OTHER = 'Other',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO string format: YYYY-MM-DD
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}
