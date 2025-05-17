import { setTranslatorConfig } from "../services/translationService";

// This function will be called to initialize the translator with the API key
export const initializeTranslator = (apiKey, endpoint, region, keyType) => {
  setTranslatorConfig(apiKey, endpoint, region, keyType);
};

// Default Microsoft Translator API endpoint
export const DEFAULT_TRANSLATOR_ENDPOINT =
  "https://api.cognitive.microsofttranslator.com";

// Default Microsoft Translator API region
export const DEFAULT_TRANSLATOR_REGION = "global";

// List of supported Indian languages with their codes
export const INDIAN_LANGUAGES = [
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
];
