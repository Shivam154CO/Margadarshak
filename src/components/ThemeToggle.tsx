import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
    const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (compact) {
        return (
            <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 group"
                aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
                title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
            >
                {resolvedTheme === 'light' ? (
                    <Moon className="w-4.5 h-4.5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                ) : (
                    <Sun className="w-4.5 h-4.5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                )}
            </button>
        );
    }

    const options = [
        { value: 'light' as const, label: 'Light', icon: Sun },
        { value: 'dark' as const, label: 'Dark', icon: Moon },
        { value: 'system' as const, label: 'System', icon: Monitor },
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-all duration-200"
                aria-label="Theme settings"
                aria-expanded={showMenu}
                aria-haspopup="true"
            >
                {resolvedTheme === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 hidden sm:inline">
                    {theme === 'system' ? 'System' : resolvedTheme === 'light' ? 'Light' : 'Dark'}
                </span>
            </button>

            {showMenu && (
                <div
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    role="menu"
                    aria-label="Theme options"
                >
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                setTheme(opt.value);
                                setShowMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${theme === opt.value
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                }`}
                            role="menuitem"
                            aria-current={theme === opt.value ? 'true' : undefined}
                        >
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
