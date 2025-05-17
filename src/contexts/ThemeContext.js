import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the theme context
export const ThemeContext = createContext();

// Create a custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Create the theme provider component
export const ThemeProvider = ({ children }) => {
  // Get the saved theme from localStorage or default to light
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check if user has a system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Save the theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    // Apply or remove the 'dark' class to the document element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Function to toggle the theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Context value
  const value = {
    darkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
