
import React, { useMemo } from 'react';
import { Transaction, Category, Currency, CURRENCY_SYMBOLS } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryPieChartProps {
  transactions: Transaction[];
  currency: Currency;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ transactions, currency }) => {
  const data = useMemo(() => {
    const categoryTotals = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<Category, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-secondary dark:text-gray-400">No expense data available.</div>;
  }
  
  const currencySymbol = CURRENCY_SYMBOLS[currency];

  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${currencySymbol}${value.toFixed(2)}`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
