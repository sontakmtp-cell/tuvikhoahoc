import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  // Available themes: 'mystical', 'asian', 'scifi'
  const [activeTheme, setActiveTheme] = useState('mystical');

  useEffect(() => {
    // Apply theme data attribute to body for CSS variables
    document.body.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  const value = {
    activeTheme,
    setActiveTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
