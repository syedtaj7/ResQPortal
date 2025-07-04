import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center px-3 py-2 bg-gray-800/80 text-white hover:bg-gray-700 rounded-full font-medium transition-all duration-300 border border-gray-600/80 hover:border-gray-500 text-xs"
        onClick={toggleDropdown}
      >
        <span className="mr-1.5">{currentLanguage.nativeName}</span>
        <svg
          className={`w-3 h-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-[9999] mt-2 w-48 rounded-xl shadow-2xl bg-gray-900 border border-gray-600 max-h-60 overflow-y-auto"
        >
          <div className="py-1">
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                  currentLanguage.code === language.code
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => handleLanguageSelect(language.code)}
              >
                <span className="mr-2">{language.nativeName}</span>
                <span className="text-gray-400">({language.name})</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LanguageSelector;
