import { useState, useEffect } from 'react';
import { Bell, Search, User, Sun, Moon } from 'lucide-react';

const Navbar = () => {
    // Initialize state from localStorage or system preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Effect to apply the dark class to the HTML element
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <nav className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm transition-colors duration-200">
            <div className="flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-slate-500">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search data, villages, or reports..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm placeholder-gray-400 dark:placeholder-slate-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 dark:bg-slate-800"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4 lg:space-x-6">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle Dark Mode"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button className="relative p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                </button>

                <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>

                <div className="flex items-center space-x-3 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Rajesh Kumar</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">District Administrator</div>
                    </div>
                    <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 shadow-sm group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-all">
                        <User className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

