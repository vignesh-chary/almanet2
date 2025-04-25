import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");
    const queryClient = useQueryClient();

    const { data: themePreference } = useQuery({
        queryKey: ["themePreference"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get('/preferences/theme');
                return res.data.darkMode ? 'dark' : 'light';
            } catch (err) {
                return "light";
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        enabled: true
    });

    const updateThemeMutation = useMutation({
        mutationFn: async (newTheme) => {
            await axiosInstance.post('/preferences/theme', { darkMode: newTheme === 'dark' });
            return newTheme;
        },
        onSuccess: (newTheme) => {
            queryClient.setQueryData(['themePreference'], newTheme);
            setTheme(newTheme);
        }
    });

    useEffect(() => {
        if (themePreference) {
            setTheme(themePreference);
        }
    }, [themePreference]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        root.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        updateThemeMutation.mutate(newTheme);
    }, [theme, updateThemeMutation]);

    const value = useMemo(() => ({
        isDarkMode: theme === 'dark',
        toggleTheme
    }), [theme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}