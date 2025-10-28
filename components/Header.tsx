import React from 'react';
import { SunIcon, MoonIcon, ChartPieIcon, ArrowRightOnRectangleIcon } from './icons';
import { Currency } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, onLogout, currency, onCurrencyChange }) => {
  return (
    <header className="bg-card dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <ChartPieIcon className="h-8 w-8 text-primary dark:text-primary-dark" />
            <h1 className="ml-3 text-2xl font-bold text-text-primary dark:text-white">
              FinSight AI
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={currency} 
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              aria-label="Select currency"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-400 hover:text-text-primary dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-gray-400 hover:text-text-primary dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-label="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
