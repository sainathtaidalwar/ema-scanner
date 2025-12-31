import { useState, useEffect } from 'react';

export const useTheme = () => {
    // Initialize state from local storage or system preference
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme');
        }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light'; // Default to light
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old class
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
            return;
        }

        // Add new class
        root.classList.add(theme);

        // Persist to local storage
        localStorage.setItem('theme', theme);

    }, [theme]);

    // Listener for system concept change if user wants 'system' mode? 
    // For simplicity, we just toggle Light/Dark. If users want fully robust 'system' syncing we can add it later.
    // But the requirement says: "if his mobile or laptop set dark mode by default our page should also change" 
    // This is handled by the initial state check.

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return { theme, toggleTheme };
};
