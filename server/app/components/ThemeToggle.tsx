"use client";
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun className={`absolute w-5 h-5 transition-all duration-300 ${
        theme === 'dark' ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
      }`} />
      <Moon className={`absolute w-5 h-5 transition-all duration-300 ${
        theme === 'light' ? 'opacity-0 -rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
      }`} />
    </button>
  );
}