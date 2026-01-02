import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Accent = 'blue' | 'green' | 'purple' | 'orange' | 'pink';

interface ThemeContextType {
    theme: Theme;
    accent: Accent;
    toggleTheme: () => void;
    setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'pastebin-theme';
const ACCENT_KEY = 'pastebin-accent';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [accent, setAccentState] = useState<Accent>(() => {
        const saved = localStorage.getItem(ACCENT_KEY);
        if (saved === 'blue' || saved === 'green' || saved === 'purple' || saved === 'orange' || saved === 'pink') {
            return saved;
        }
        return 'blue';
    });

    useEffect(() => {
        const root = document.documentElement;

        // Apply theme
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;

        // Remove all accent classes
        root.classList.remove('accent-blue', 'accent-green', 'accent-purple', 'accent-orange', 'accent-pink');

        // Apply new accent (blue is default, no class needed)
        if (accent !== 'blue') {
            root.classList.add(`accent-${accent}`);
        }
        localStorage.setItem(ACCENT_KEY, accent);
    }, [accent]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setAccent = (newAccent: Accent) => {
        setAccentState(newAccent);
    };

    return (
        <ThemeContext.Provider value={{ theme, accent, toggleTheme, setAccent }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
