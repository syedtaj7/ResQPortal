import React, { createContext, useState, useEffect, useContext } from 'react';

// Define the supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

// Create the language context
export const LanguageContext = createContext();

// Create a custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Create the language provider component
export const LanguageProvider = ({ children }) => {
  // Get the saved language from localStorage or default to English
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage ? JSON.parse(savedLanguage) : SUPPORTED_LANGUAGES[0];
  });

  // Save the selected language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', JSON.stringify(currentLanguage));
  }, [currentLanguage]);

  // Function to change the language
  const changeLanguage = (languageCode) => {
    const selectedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
    if (selectedLanguage) {
      setCurrentLanguage(selectedLanguage);
    }
  };

  // Context value
  const value = {
    currentLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
