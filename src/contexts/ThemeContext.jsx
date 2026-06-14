import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsStorage } from '../utils/storage';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
    // Load theme from settings
    const loadTheme = async () => {
    const settings = await settingsStorage.get();
    const savedTheme = settings.theme || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
    };

    loadTheme();
    }, []);

    const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    };

    const changeTheme = async (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);

    // Save to settings
    const settings = await settingsStorage.get();
    settings.theme = newTheme;
    await settingsStorage.save(settings);
    };

    return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
    {children}
    </ThemeContext.Provider>
    );
};
