import React, { useState, useEffect } from "react";
import {
  initializeTranslator,
  DEFAULT_TRANSLATOR_ENDPOINT,
  DEFAULT_TRANSLATOR_REGION,
} from "../config/translatorConfig";

const TranslatorInitializer = ({ children }) => {
  // We use setIsInitialized but don't need to read the value
  const [, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to get the API key from environment variables
    const apiKey = process.env.REACT_APP_TRANSLATOR_API_KEY;
    const endpoint =
      process.env.REACT_APP_TRANSLATOR_ENDPOINT || DEFAULT_TRANSLATOR_ENDPOINT;
    const region =
      process.env.REACT_APP_TRANSLATOR_REGION || DEFAULT_TRANSLATOR_REGION;
    const keyType = process.env.REACT_APP_TRANSLATOR_KEY_TYPE || "subscription";

    console.log("Translator environment variables:", {
      hasApiKey: !!apiKey,
      endpoint,
      region,
      keyType,
    });

    if (apiKey) {
      try {
        initializeTranslator(apiKey, endpoint, region, keyType);
        setIsInitialized(true);
        console.log("Microsoft Translator API initialized successfully");
      } catch (err) {
        setError("Failed to initialize Microsoft Translator API");
        console.error("Failed to initialize Microsoft Translator API:", err);
      }
    } else {
      console.warn(
        "Microsoft Translator API key not found in environment variables"
      );
      // We'll still render the app, but translations won't work
      setIsInitialized(true);
    }
  }, []);

  if (error) {
    // You could render an error message here, but for now we'll just log it and continue
    console.error(error);
  }

  // Always render children, even if initialization failed
  // This ensures the app works even without translation capabilities
  return <>{children}</>;
};

export default TranslatorInitializer;
