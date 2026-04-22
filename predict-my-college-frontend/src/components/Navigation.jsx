import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const getCurrentPage = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/colleges') return 'colleges';
    if (location.pathname === '/compare') return 'compare';
    if (location.pathname === '/reviews') return 'reviews';
    if (location.pathname === '/about') return 'about';
    return '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = getCurrentPage();

  return (
    <header className="sticky top-0 z-50 w-full flex justify-between items-center px-8 py-6 max-w-7xl mx-auto bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-colors duration-300 print:hidden">
      <div
        className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-fuchsia-500 cursor-pointer"
        onClick={() => navigate('/')}
      >
        Futurecollege.com
      </div>
      <div className="flex items-center space-x-6">
        <nav className="flex space-x-6">
          <button
            onClick={() => navigate('/')}
            className={`transition-all duration-300 font-medium ${
              currentPage === 'home'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-cyan-400 dark:border-cyan-400 pb-1 dark:text-shadow-glow'
                : 'text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-cyan-300'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/colleges')}
            className={`transition-all duration-300 font-medium ${
              currentPage === 'colleges'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-cyan-400 dark:border-cyan-400 pb-1 dark:text-shadow-glow'
                : 'text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-cyan-300'
            }`}
          >
            Colleges & Cutoffs
          </button>
          <button
            onClick={() => navigate('/compare')}
            className={`transition-all duration-300 font-medium ${
              currentPage === 'compare'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-cyan-400 dark:border-cyan-400 pb-1 dark:text-shadow-glow'
                : 'text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-cyan-300'
            }`}
          >
            Compare
          </button>
          <button
            onClick={() => navigate('/reviews')}
            className={`transition-all duration-300 font-medium ${
              currentPage === 'reviews'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-cyan-400 dark:border-cyan-400 pb-1 dark:text-shadow-glow'
                : 'text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-cyan-300'
            }`}
          >
            Reviews
          </button>
          <button
            onClick={() => navigate('/about')}
            className={`transition-all duration-300 font-medium ${
              currentPage === 'about'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-cyan-400 dark:border-cyan-400 pb-1 dark:text-shadow-glow'
                : 'text-slate-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-cyan-300'
            }`}
          >
            About Us
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className={`transition-all duration-300 font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-800 ${
                currentPage === 'admin'
                  ? 'border-purple-500 shadow-sm'
                  : 'hover:bg-purple-100 dark:hover:border-purple-700'
              }`}
            >
              Admin Panel
            </button>
          )}
        </nav>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Auth Button */}
        {user ? (
          <button
            onClick={handleLogout}
            className="
              relative flex items-center gap-2 px-4 py-2
              text-white text-base font-semibold
              bg-rose-500 border-rose-500
              dark:bg-slate-800 rounded-lg shadow-md dark:border-slate-700
              overflow-hidden group
              transition-all duration-300 ease-in-out
              hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:bg-rose-600 hover:border-rose-500
              transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-rose-500
            "
          >
            <LogOut size={18} className="transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
            <span className="relative z-10">Logout</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="
              relative flex items-center gap-2 px-4 py-2
              text-white text-base font-semibold
              bg-blue-600 border-blue-600
              dark:bg-cyan-600 rounded-lg shadow-md dark:border-cyan-700
              overflow-hidden group
              transition-all duration-300 ease-in-out
              hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-700
              transform hover:scale-105
            "
          >
            <span className="relative z-10">Login / Sign Up</span>
          </button>
        )}
      </div>
    </header>
  );
}
