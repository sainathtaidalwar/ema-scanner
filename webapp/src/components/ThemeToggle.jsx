import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors duration-200
                bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-yellow-400
                hover:bg-gray-200 dark:hover:bg-gray-700
                focus:outline-none focus:ring-2 focus:ring-brand"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <Moon size={20} className="text-brand-glow" />
            ) : (
                <Sun size={20} className="text-orange-500" />
            )}
        </button>
    );
};

export default ThemeToggle;
