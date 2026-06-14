import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsStorage } from '../utils/storage';
import { translations } from '../utils/i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ar');
    const [isRTL, setIsRTL] = useState(true);

    useEffect(() => {
    // Load language from settings
    const loadLanguage = async () => {
    const settings = await settingsStorage.get();
    const lang = settings.language || 'ar';
    setLanguage(lang);
    setIsRTL(lang === 'ar');

    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    };

    loadLanguage();
    }, []);

    const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    setIsRTL(newLang === 'ar');

    // Update HTML attributes
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';

    // Save to settings
    const settings = await settingsStorage.get();
    settings.language = newLang;
    await settingsStorage.save(settings);
    };

    const t = (key) => {
    return translations[language]?.[key] || key;
    };

    return (
    <LanguageContext.Provider value={{ language, isRTL, changeLanguage, t }}>
    {children}
    </LanguageContext.Provider>
    );
};
