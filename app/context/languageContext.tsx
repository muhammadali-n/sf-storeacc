'use client'
import React, { createContext, useContext, useState } from 'react';

interface LanguageContextProps {
  language: string;
  changeLanguage: (lang: string) => void;
}

const defaultValue: LanguageContextProps = {
  language: 'en',
  changeLanguage: () => {},
};

const LanguageContext = createContext<LanguageContextProps>(defaultValue);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const contextValue: LanguageContextProps = {
    language,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }

  return context;
};
