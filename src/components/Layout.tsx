import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart, User, Menu, Leaf, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Chatbot } from './Chatbot';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-0 md:pt-16 transition-colors duration-300">
      {/* Desktop Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 hidden md:block bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-green-600 font-bold text-xl">
            <Leaf className="w-6 h-6" />
            <span>GreenBloom</span>
          </Link>

          <nav className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-green-600",
                  location.pathname === item.path ? "text-green-600" : "text-gray-500 dark:text-gray-400"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            {isAdminPage && (
              <Link to="/admin" className="text-sm font-medium text-amber-600 hover:text-amber-700">
                Admin Panel
              </Link>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-green-600 font-bold text-lg">
          <Leaf className="w-5 h-5" />
          <span>GreenBloom</span>
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <Link to="/cart" className="relative text-gray-500 dark:text-gray-400">
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white dark:border-gray-900">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 pt-20 md:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between safe-area-bottom">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center space-y-1 transition-colors",
              location.pathname === item.path ? "text-green-600" : "text-gray-400 dark:text-gray-500"
            )}
          >
            <item.icon className={cn("w-6 h-6", location.pathname === item.path && "animate-bounce-short")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <Chatbot />
    </div>
  );
};
