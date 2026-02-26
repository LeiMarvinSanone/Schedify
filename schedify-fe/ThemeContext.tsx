import React, { createContext, useContext, useState } from 'react';

// ─── Theme Colors ─────────────────────────────────────────────────────────────

export const DARK = {
  bg: '#2d3748',
  card: '#3d4e63',
  cardBorder: '#4a5f78',
  input: '#4a5f78',
  title: '#ffffff',
  subtitle: '#a0aec0',
  text: '#e2e8f0',
  muted: '#718096',
  accent: '#4a9d5f',
  navBg: '#3d4e63',
  navBorder: '#4a5568',
  badgeBg: '#1a3a2a',
  badgeText: '#a0d080',
  divider: '#4a5f78',
  danger: '#fc8181',
  lockBg: '#1a2a3a',
  lockColor: '#63b3ed',
};

export const LIGHT = {
  bg: '#f0f4f8',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  input: '#edf2f7',
  title: '#1a202c',
  subtitle: '#718096',
  text: '#2d3748',
  muted: '#a0aec0',
  accent: '#4a9d5f',
  navBg: '#ffffff',
  navBorder: '#e2e8f0',
  badgeBg: '#ebf8ee',
  badgeText: '#276749',
  divider: '#e2e8f0',
  danger: '#e53e3e',
  lockBg: '#ebf4ff',
  lockColor: '#4299e1',
};

export type Theme = typeof DARK;

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  theme: DARK,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(prev => !prev);
  const theme = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme() {
  return useContext(ThemeContext);
}