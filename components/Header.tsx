import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SunIcon, MoonIcon, ChartPieIcon, PlusIcon, Bars3Icon, XMarkIcon } from './icons';
import { Currency, User } from '../types';

interface HeaderProps {
  user: User;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onAddTransaction: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, isDarkMode, toggleDarkMode, currency, onCurrencyChange, onAddTransaction, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { label: 'Transactions', path: '/transactions' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Budgets', path: '/budgets' },
    { label: 'Insights', path: '/insights' },
    { label: 'Horizon', path: '/horizon' },
    { label: 'News', path: '/news' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-6 lg:gap-8">
            <NavLink to="/" className="flex items-center group shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <ChartPieIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-text-primary dark:text-white tracking-tight hidden lg:block">
                FinSight<span className="text-indigo-600">.</span>
              </h1>
            </NavLink>
            
            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                        : 'text-text-secondary dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Currency Selector - Hardware Style (Recipe 3) */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-1 border border-gray-200 dark:border-gray-700 shadow-inner">
              <button 
                onClick={() => onCurrencyChange('USD')}
                className={`relative px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  currency === 'USD' 
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                USD
                {currency === 'USD' && (
                  <motion.div layoutId="active-currency" className="absolute inset-0 bg-indigo-500/5 rounded-xl border border-indigo-500/20" />
                )}
              </button>
              <button 
                onClick={() => onCurrencyChange('INR')}
                className={`relative px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  currency === 'INR' 
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                INR
                {currency === 'INR' && (
                  <motion.div layoutId="active-currency" className="absolute inset-0 bg-indigo-500/5 rounded-xl border border-indigo-500/20" />
                )}
              </button>
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />

            <button
              onClick={toggleDarkMode}
              className="hidden md:block p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />

            <button
              onClick={onAddTransaction}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add</span>
            </button>

            <button
              onClick={onAddTransaction}
              className="lg:hidden p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
              aria-label="Add transaction"
            >
              <PlusIcon className="h-5 w-5" />
            </button>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />

            {/* User Profile - Recipe 8/12 */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-1 pr-3 py-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  {getInitials(user.displayName)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-bold text-text-primary dark:text-white leading-none">{user.displayName || 'John Doe'}</p>
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-20"
                    >
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700 mb-2">
                        <p className="text-xs font-bold text-text-primary dark:text-white truncate">{user.displayName}</p>
                        <p className="text-[10px] text-text-secondary dark:text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          onLogout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors font-bold"
                      >
                        Log Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 md:hidden" />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-100 dark:border-gray-700 transition-all md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-base font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                          : 'text-text-secondary dark:text-gray-400'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text-secondary dark:text-gray-400 uppercase tracking-widest">Currency</span>
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-1 border border-gray-200 dark:border-gray-700 shadow-inner">
                    <button
                      onClick={() => onCurrencyChange('USD')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all ${
                        currency === 'USD'
                          ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg'
                          : 'text-gray-400'
                      }`}
                    >
                      USD
                    </button>
                    <button
                      onClick={() => onCurrencyChange('INR')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all ${
                        currency === 'INR'
                          ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg'
                          : 'text-gray-400'
                      }`}
                    >
                      INR
                    </button>
                  </div>
                </div>

              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                      {getInitials(user.displayName)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary dark:text-white">{user.displayName}</p>
                      <p className="text-[10px] text-text-secondary dark:text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
