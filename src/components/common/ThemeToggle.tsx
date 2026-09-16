import React from 'react';
import { Sun, Moon, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'pill' | 'compact' | 'segmented';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = true,
  variant = 'pill'
}) => {
  const { theme, isDark, toggleTheme, setTheme, resetTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            !isDark
              ? 'bg-white text-indigo-600 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Switch to Light Mode"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isDark
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Switch to Dark Mode"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-200" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={resetTheme}
          className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Reset theme to system default"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        <button
          id="theme-toggle-compact"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Currently ${isDark ? 'Dark' : 'Light'} mode. Click to switch to ${isDark ? 'Light' : 'Dark'}.`}
          className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
            isDark
              ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-amber-200 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-indigo-600 shadow-xs'
          } ${className}`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        id="theme-toggle-btn"
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Currently ${isDark ? 'Dark' : 'Light'}. Click to switch to ${isDark ? 'Light' : 'Dark'}.`}
        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer ${
          isDark
            ? 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700 hover:border-slate-600 hover:text-white shadow-xs'
            : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-xs'
        } ${className}`}
      >
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
            isDark ? 'bg-amber-400/20 text-amber-300' : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45" />
          ) : (
            <Moon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </div>

        {showLabel && (
          <span className="select-none tracking-tight">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={resetTheme}
        title="Reset theme to system preference"
        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
      </button>
    </div>
  );
};
