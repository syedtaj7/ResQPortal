import axios from "axios";

// This will be replaced with the actual API key provided by the user
let TRANSLATOR_API_KEY = "";
let TRANSLATOR_ENDPOINT = "https://api.cognitive.microsofttranslator.com";
let TRANSLATOR_REGION = "global";
let TRANSLATOR_KEY_TYPE = "subscription"; // 'subscription' or 'authorization'

// Function to set the API key and endpoint
export const setTranslatorConfig = (
  apiKey,
  endpoint = "https://api.cognitive.microsofttranslator.com",
  region = "global",
  keyType = "subscription"
) => {
  TRANSLATOR_API_KEY = apiKey;
  TRANSLATOR_ENDPOINT = endpoint;
  TRANSLATOR_REGION = region;
  TRANSLATOR_KEY_TYPE = keyType;

  console.log("Translator config set:", {
    endpoint,
    region,
    keyType,
    keyLength: apiKey ? apiKey.length : 0,
  });
};

// Cache for storing translations to reduce API calls
const translationCache = {};

// Function to generate a cache key
const getCacheKey = (text, targetLanguage) => {
  return `${text}|${targetLanguage}`;
};

// Function to translate text
export const translateText = async (text, targetLanguage) => {
  // If the target language is English, return the original text
  if (targetLanguage === "en") {
    return text;
  }

  // Check if the translation is already in the cache
  const cacheKey = getCacheKey(text, targetLanguage);
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  // If no API key is set, return the original text
  if (!TRANSLATOR_API_KEY) {
    console.warn("Translator API key not set. Using original text.");
    return text;
  }

  try {
    // Prepare headers based on key type
    const headers = {
      "Content-type": "application/json",
    };

    // Add the appropriate authentication header
    if (TRANSLATOR_KEY_TYPE === "subscription") {
      headers["Ocp-Apim-Subscription-Key"] = TRANSLATOR_API_KEY;
      if (TRANSLATOR_REGION !== "global") {
        headers["Ocp-Apim-Subscription-Region"] = TRANSLATOR_REGION;
      }
    } else {
      headers["Authorization"] = `Bearer ${TRANSLATOR_API_KEY}`;
    }

    console.log(
      "Making translation request with headers:",
      JSON.stringify({
        ...headers,
        "Ocp-Apim-Subscription-Key": headers["Ocp-Apim-Subscription-Key"]
          ? "***"
          : undefined,
      })
    );

    const response = await axios({
      baseURL: TRANSLATOR_ENDPOINT,
      url: "/translate",
      method: "post",
      headers,
      params: {
        "api-version": "3.0",
        to: targetLanguage,
      },
      data: [
        {
          text: text,
        },
      ],
      responseType: "json",
    });

    const translatedText = response.data[0].translations[0].text;

    // Store the translation in the cache
    translationCache[cacheKey] = translatedText;

    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text on error
  }
};

// Function to translate multiple texts at once (batch translation)
export const translateBatch = async (texts, targetLanguage) => {
  // If the target language is English, return the original texts
  if (targetLanguage === "en") {
    return texts;
  }

  // If no API key is set, return the original texts
  if (!TRANSLATOR_API_KEY) {
    console.warn("Translator API key not set. Using original texts.");
    return texts;
  }

  // Check which texts are already in the cache
  const uncachedTexts = [];
  const uncachedIndices = [];
  const results = [...texts];

  texts.forEach((text, index) => {
    const cacheKey = getCacheKey(text, targetLanguage);
    if (translationCache[cacheKey]) {
      results[index] = translationCache[cacheKey];
    } else {
      uncachedTexts.push(text);
      uncachedIndices.push(index);
    }
  });

  // If all texts are cached, return the results
  if (uncachedTexts.length === 0) {
    return results;
  }

  try {
    // Prepare headers based on key type
    const headers = {
      "Content-type": "application/json",
    };

    // Add the appropriate authentication header
    if (TRANSLATOR_KEY_TYPE === "subscription") {
      headers["Ocp-Apim-Subscription-Key"] = TRANSLATOR_API_KEY;
      if (TRANSLATOR_REGION !== "global") {
        headers["Ocp-Apim-Subscription-Region"] = TRANSLATOR_REGION;
      }
    } else {
      headers["Authorization"] = `Bearer ${TRANSLATOR_API_KEY}`;
    }

    const response = await axios({
      baseURL: TRANSLATOR_ENDPOINT,
      url: "/translate",
      method: "post",
      headers,
      params: {
        "api-version": "3.0",
        to: targetLanguage,
      },
      data: uncachedTexts.map((text) => ({ text: text })),
      responseType: "json",
    });

    // Update the results and cache
    response.data.forEach((item, index) => {
      const translatedText = item.translations[0].text;
      const originalIndex = uncachedIndices[index];
      results[originalIndex] = translatedText;

      // Store in cache
      const cacheKey = getCacheKey(uncachedTexts[index], targetLanguage);
      translationCache[cacheKey] = translatedText;
    });

    return results;
  } catch (error) {
    console.error("Batch translation error:", error);
    return texts; // Return original texts on error
  }
};
