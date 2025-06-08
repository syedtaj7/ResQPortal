import React, { createContext, useContext, useEffect } from 'react';

// Create the theme context
export const ThemeContext = createContext();

// Create a custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Create the theme provider component
export const ThemeProvider = ({ children }) => {
  // Force dark mode always - no state needed

  // Apply dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // Function to toggle the theme (disabled - always dark)
  const toggleTheme = () => {
    // Do nothing - dark mode only
  };

  // Context value
  const value = {
    darkMode: true,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
