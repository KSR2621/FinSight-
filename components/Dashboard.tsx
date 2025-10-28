
import React, { useMemo } from 'react';
import { Transaction, TransactionType, Currency, CURRENCY_SYMBOLS } from '../types';
import CategoryPieChart from './CategoryPieChart';
import ExpenseTrendChart from './ExpenseTrendChart';
import AiSummary from './AiSummary';
import { ArrowUpIcon, ArrowDownIcon, ScaleIcon } from './icons';

interface DashboardProps {
  transactions: Transaction[];
  currency: Currency;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, currency }) => {
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === TransactionType.INCOME) {
          acc.totalIncome += t.amount;
        } else {
          acc.totalExpenses += t.amount;
        }
        acc.balance = acc.totalIncome - acc.totalExpenses;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, balance: 0 }
    );
  }, [transactions]);

  const expenseTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE), [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Income" amount={totalIncome} icon={<ArrowUpIcon className="h-8 w-8 text-green-500" />} currency={currency} />
        <StatCard title="Total Expenses" amount={totalExpenses} icon={<ArrowDownIcon className="h-8 w-8 text-red-500" />} currency={currency} />
        <StatCard title="Balance" amount={balance} icon={<ScaleIcon className="h-8 w-8 text-indigo-500" />} currency={currency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-white">Expense Trend (Last 30 Days)</h3>
            <ExpenseTrendChart transactions={expenseTransactions} currency={currency} />
        </div>
        <div className="bg-card dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-white">Expenses by Category</h3>
            <CategoryPieChart transactions={expenseTransactions} currency={currency} />
        </div>
      </div>

      <AiSummary transactions={transactions} />
    </div>
  );
};

interface StatCardProps {
    title: string;
    amount: number;
    icon: React.ReactNode;
    currency: Currency;
}

const StatCard: React.FC<StatCardProps> = ({ title, amount, icon, currency }) => {
    const isNegative = amount < 0;
    const currencySymbol = CURRENCY_SYMBOLS[currency];

    const formattedAmount = (isNegative ? '-' : '') + currencySymbol + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="bg-card dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-text-secondary dark:text-gray-400">{title}</p>
                <p className={`text-2xl font-bold text-text-primary dark:text-white ${isNegative ? 'text-red-500' : ''}`}>
                    {formattedAmount}
                </p>
            </div>
            {icon}
        </div>
    );
}

export default Dashboard;
