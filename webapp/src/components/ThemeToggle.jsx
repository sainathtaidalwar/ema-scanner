import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="group relative p-2 rounded-full transition-all duration-300
                bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/20 
                backdrop-blur-md border border-gray-200 dark:border-white/10
                shadow-sm hover:shadow-md hover:shadow-indigo-500/20"
            aria-label="Toggle Theme"
        >
            <div className="relative z-10">
                {theme === 'dark' ? (
                    <Moon size={20} className="text-indigo-300 transition-transform group-hover:-rotate-12" />
                ) : (
                    <Sun size={20} className="text-amber-500 transition-transform group-hover:rotate-45" />
                )}
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
    );
};

export default ThemeToggle;
