import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── 4-Color Palette Type ───
export interface ThemePalette {
    // Core 4 colors
    bg: string;          // Page background
    card: string;        // Card / surface background
    accent: string;      // Primary accent (buttons, highlights)
    text: string;        // Primary text

    // Derived colors
    textSecondary: string;  // Muted text
    border: string;         // Card borders
    surfaceHover: string;   // Hover / pressed states
    progressTrack: string;  // Progress bar background
    accentMuted: string;    // Accent at lower opacity
    danger: string;         // Error / destructive
    success: string;        // Positive / success
    cardAlt: string;        // Alternative card bg (nested surfaces)
    statusBarStyle: 'light' | 'dark'; // For StatusBar
}

// ─── Theme Definitions ───
export const THEMES: Record<string, ThemePalette> = {
    'dark-obsidian': {
        bg: '#0a0a0f',
        card: '#111118',
        accent: '#f5d020',
        text: '#ececec',
        textSecondary: '#888899',
        border: '#1e1e2a',
        surfaceHover: '#1a1a24',
        progressTrack: '#1a1a24',
        accentMuted: 'rgba(245, 208, 32, 0.15)',
        danger: '#ef4444',
        success: '#22c55e',
        cardAlt: '#0a0a0f',
        statusBarStyle: 'light',
    },
    'light-matte': {
        bg: '#f2efe9',
        card: '#ffffff',
        accent: '#d4890e',
        text: '#1a1a1a',
        textSecondary: '#6b6b6b',
        border: '#e0dcd4',
        surfaceHover: '#ece8e0',
        progressTrack: '#e8e4dc',
        accentMuted: 'rgba(212, 137, 14, 0.12)',
        danger: '#dc2626',
        success: '#16a34a',
        cardAlt: '#f7f5f0',
        statusBarStyle: 'dark',
    },
    'ocean-breeze': {
        bg: '#0c1929',
        card: '#132337',
        accent: '#38bdf8',
        text: '#e2e8f0',
        textSecondary: '#7a8fa6',
        border: '#1e3350',
        surfaceHover: '#1a2d46',
        progressTrack: '#1a2d46',
        accentMuted: 'rgba(56, 189, 248, 0.15)',
        danger: '#f87171',
        success: '#34d399',
        cardAlt: '#0c1929',
        statusBarStyle: 'light',
    },
};

export const THEME_NAMES = Object.keys(THEMES);
export const THEME_LABELS: Record<string, string> = {
    'dark-obsidian': 'Dark Obsidian',
    'light-matte': 'Light Matte',
    'ocean-breeze': 'Ocean Breeze',
};

const STORAGE_KEY = 'quest-log-theme';

// ─── Context ───
interface ThemeContextValue {
    theme: ThemePalette;
    themeName: string;
    setTheme: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: THEMES['dark-obsidian'],
    themeName: 'dark-obsidian',
    setTheme: () => { },
});

// ─── Provider ───
export function AppThemeProvider({ children }: { children: ReactNode }) {
    const [themeName, setThemeName] = useState('dark-obsidian');

    // Load saved theme on mount
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
            if (saved && THEMES[saved]) {
                setThemeName(saved);
            }
        });
    }, []);

    const setTheme = (name: string) => {
        if (THEMES[name]) {
            setThemeName(name);
            AsyncStorage.setItem(STORAGE_KEY, name);
        }
    };

    const theme = THEMES[themeName];

    return (
        <ThemeContext.Provider value={{ theme, themeName, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// ─── Hook ───
export function useAppTheme() {
    return useContext(ThemeContext);
}
