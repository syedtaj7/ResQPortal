import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TranslatableText from './TranslatableText';

const GoogleAPISetup = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Load existing API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('googleSpeechApiKey');
    if (savedKey) {
      setApiKey(savedKey);
      setIsValid(true);
    }
  }, []);

  // Validate API key format
  const validateApiKey = (key) => {
    // Google API keys typically start with "AIza" and are 39 characters long
    const apiKeyPattern = /^AIza[0-9A-Za-z-_]{35}$/;
    return apiKeyPattern.test(key);
  };

  // Test API key with Google Speech API
  const testApiKey = async (key) => {
    if (!validateApiKey(key)) {
      return false;
    }

    try {
      setIsValidating(true);
      
      // Test with a simple request to Google Speech API
      const testUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${key}`;
      
      const testRequest = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
        },
        audio: {
          content: '' // Empty content for validation test
        }
      };

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRequest)
      });

      // Even with empty audio, a valid API key should return a specific error
      // Invalid API key returns 403, valid key with empty audio returns 400
      if (response.status === 400) {
        return true; // Valid API key
      } else if (response.status === 403) {
        return false; // Invalid API key
      } else {
        return false; // Other error
      }
    } catch (error) {
      console.error('API key validation error:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Handle API key input
  const handleApiKeyChange = (e) => {
    const key = e.target.value.trim();
    setApiKey(key);
    
    if (key.length === 0) {
      setIsValid(false);
    } else if (validateApiKey(key)) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  // Save API key
  const saveApiKey = async () => {
    if (!apiKey) {
      alert('Please enter an API key');
      return;
    }

    if (!validateApiKey(apiKey)) {
      alert('Invalid API key format. Google API keys should start with "AIza" and be 39 characters long.');
      return;
    }

    // Test the API key
    const isValidKey = await testApiKey(apiKey);
    
    if (isValidKey) {
      localStorage.setItem('googleSpeechApiKey', apiKey);
      alert('✅ Google Speech API key saved successfully!\n\nThe voice assistant will now use Google\'s Speech-to-Text API for better accuracy and reliability.');
      onClose();
    } else {
      alert('❌ Invalid API key or API not enabled.\n\nPlease check:\n1. API key is correct\n2. Cloud Speech-to-Text API is enabled\n3. API key has proper permissions');
    }
  };

  // Remove API key
  const removeApiKey = () => {
    if (window.confirm('Remove Google Speech API key?\n\nThe voice assistant will fall back to browser\'s Web Speech API.')) {
      localStorage.removeItem('googleSpeechApiKey');
      setApiKey('');
      setIsValid(false);
      alert('Google Speech API key removed. Voice assistant will use browser API.');
    }
  };

  // Test current setup
  const testCurrentSetup = () => {
    const currentKey = localStorage.getItem('googleSpeechApiKey');
    if (currentKey) {
      alert('✅ Google Speech API is configured!\n\nYour voice assistant is using Google\'s Speech-to-Text API for enhanced accuracy and reliability.');
    } else {
      alert('ℹ️ No Google API key configured.\n\nVoice assistant is using browser\'s Web Speech API. Add a Google API key for better performance.');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            🎙️ <TranslatableText>Google Speech API Setup</TranslatableText>
          </h2>
          <p className="text-blue-100">
            <TranslatableText>Enhanced voice recognition for better accuracy and reliability</TranslatableText>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Current Status */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              <TranslatableText>Current Status</TranslatableText>
            </h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${localStorage.getItem('googleSpeechApiKey') ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-gray-300">
                {localStorage.getItem('googleSpeechApiKey') ? (
                  <TranslatableText>Google Speech API Active</TranslatableText>
                ) : (
                  <TranslatableText>Using Browser Speech API</TranslatableText>
                )}
              </span>
              <button
                onClick={testCurrentSetup}
                className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                <TranslatableText>Test</TranslatableText>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              <TranslatableText>Google Speech API Key</TranslatableText>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <TranslatableText>API Key</TranslatableText>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    placeholder="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  {apiKey && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValid ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <span className="text-red-400">✗</span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  <TranslatableText>Google API keys start with "AIza" and are 39 characters long</TranslatableText>
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={saveApiKey}
                  disabled={!apiKey || isValidating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <TranslatableText>Validating...</TranslatableText>
                    </>
                  ) : (
                    <TranslatableText>Save API Key</TranslatableText>
                  )}
                </button>
                
                {localStorage.getItem('googleSpeechApiKey') && (
                  <button
                    onClick={removeApiKey}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <TranslatableText>Remove</TranslatableText>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/30 border border-blue-600/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-300">
                <TranslatableText>Setup Instructions</TranslatableText>
              </h3>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-blue-400 hover:text-blue-300"
              >
                {showInstructions ? '▼' : '▶'}
              </button>
            </div>
            
            <AnimatePresence>
              {showInstructions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-blue-200 text-sm space-y-3"
                >
                  <div>
                    <h4 className="font-semibold mb-2">1. Create Google Cloud Project:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Cloud Console</a></li>
                      <li>Create a new project or select existing one</li>
                      <li>Name it "ResQTech Voice Assistant"</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">2. Enable Speech-to-Text API:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Go to APIs & Services → Library</li>
                      <li>Search for "Cloud Speech-to-Text API"</li>
                      <li>Click and press "Enable"</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">3. Create API Key:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Go to APIs & Services → Credentials</li>
                      <li>Click "+ CREATE CREDENTIALS" → API Key</li>
                      <li>Copy the generated key and paste above</li>
                      <li>Optional: Restrict key to your domain for security</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-3 mt-4">
                    <h4 className="font-semibold text-green-300 mb-1">💰 Free Tier:</h4>
                    <p>60 minutes of speech processing per month at no cost!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Benefits */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-2">✅ With Google API:</h4>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• No network errors</li>
                <li>• Higher accuracy</li>
                <li>• Better noise handling</li>
                <li>• Multi-language support</li>
                <li>• Mobile compatibility</li>
              </ul>
            </div>
            
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-300 mb-2">⚠️ Without Google API:</h4>
              <ul className="text-yellow-200 text-sm space-y-1">
                <li>• May have network errors</li>
                <li>• Lower accuracy</li>
                <li>• Browser limitations</li>
                <li>• Limited mobile support</li>
                <li>• Manual backup needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-white/80 hover:text-white"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default GoogleAPISetup;
