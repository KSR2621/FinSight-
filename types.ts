

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

export type Currency = 'USD' | 'INR';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
};

// FIX: Make properties optional to match the Gemini API response structure.
export interface GroundingChunkSource {
  uri?: string;
  title?: string;
}

// FIX: Make web property optional as grounding chunks can be of different types (e.g., maps).
export interface GroundingChunk {
  web?: GroundingChunkSource;
}
