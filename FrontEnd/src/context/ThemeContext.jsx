import React, { createContext, useContext, useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check local storage or default to light
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // YOUR EXACT COLOR PALETTE
  const themeColors = {
    light: {
      primary: '#D9F17F',    // Lime Green
      secondary: '#CDE7FE',  // Soft Blue
      accent: '#FEEF75',     // Yellow
      background: '#ffffff', // Light BG
      card: '#ffffff',       // Light Card
      text: '#111827',       // gray-900
      textMuted: '#6b7280',  // gray-500
      border: '#f3f4f6',     // gray-100
      sidebar: '#ffffff'     // Light Sidebar
    },
    dark: {
      primary: '#D9F17F',    // Lime Green
      secondary: '#CDE7FE',  // Soft Blue
      accent: '#FEEF75',     // Yellow
      background: '#0B0F19', // Very Dark Blue/Gray
      card: '#111827',       // gray-900
      text: '#f9fafb',       // gray-50
      textMuted: '#9ca3af',  // gray-400
      border: '#374151',     // gray-700
      sidebar: '#0B0F19'     // Dark Sidebar (Matches BG)
    }
  };

  const colors = themeColors[theme];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 1. Manage Tailwind 'dark' class
  // 2. Inject your CUSTOM colors into the DOM body
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Apply Tailwind Dark Class
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Force Background and Text colors on the Body to ensure global coverage
    body.style.backgroundColor = colors.background;
    body.style.color = colors.text;
    body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

  }, [theme, colors]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1f2937' : '#fff',
            color: theme === 'dark' ? '#fff' : '#333',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#f3f4f6'}`
          },
        }}
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);