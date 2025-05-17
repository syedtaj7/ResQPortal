import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Component for translating text with automatic re-translation when language changes
const TranslatableText = ({ children, as = 'span', className = '' }) => {
  const { translate, currentLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const translateText = async () => {
      if (typeof children !== 'string') return;
      
      setIsLoading(true);
      const result = await translate(children);
      
      if (isMounted) {
        setTranslatedText(result);
        setIsLoading(false);
      }
    };

    translateText();

    return () => {
      isMounted = false;
    };
  }, [children, translate, currentLanguage]);

  // If children is not a string, return it as is
  if (typeof children !== 'string') {
    return children;
  }

  // Render the component with the specified tag
  const Component = as;
  
  return (
    <Component className={`${className} ${isLoading ? 'opacity-70' : ''}`}>
      {translatedText}
    </Component>
  );
};

export default TranslatableText;
