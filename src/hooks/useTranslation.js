import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText, translateBatch } from '../services/translationService';

// Custom hook for translating text
export const useTranslation = () => {
  const { currentLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to translate a single text
  const translate = useCallback(async (text) => {
    if (!text) return '';
    
    try {
      setIsLoading(true);
      setError(null);
      const translatedText = await translateText(text, currentLanguage.code);
      return translatedText;
    } catch (err) {
      setError(err.message);
      return text; // Return original text on error
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage.code]);

  // Function to translate multiple texts at once
  const translateMultiple = useCallback(async (texts) => {
    if (!texts || texts.length === 0) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      const translatedTexts = await translateBatch(texts, currentLanguage.code);
      return translatedTexts;
    } catch (err) {
      setError(err.message);
      return texts; // Return original texts on error
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage.code]);

  return {
    translate,
    translateMultiple,
    isLoading,
    error,
    currentLanguage
  };
};

// Component for translating text with automatic re-translation when language changes
export const useTranslatedText = (originalText) => {
  const { translate, currentLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState(originalText);

  useEffect(() => {
    let isMounted = true;
    
    const translateText = async () => {
      const result = await translate(originalText);
      if (isMounted) {
        setTranslatedText(result);
      }
    };

    translateText();

    return () => {
      isMounted = false;
    };
  }, [originalText, translate, currentLanguage]);

  return translatedText;
};
