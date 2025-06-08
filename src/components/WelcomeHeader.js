import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import TranslatableText from "./TranslatableText";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";

const WelcomeHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 shadow-2xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white cursor-pointer drop-shadow-lg"
                  onClick={() => navigate("/")}>
                <TranslatableText>ResQTech</TranslatableText>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <LanguageSelector />
              <ThemeToggle />

              {/* Login/Signup Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 text-white border border-white/30 rounded-full font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
                >
                  <TranslatableText>Sign In</TranslatableText>
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-full font-medium transition-all duration-300 hover:from-yellow-400 hover:to-orange-400 hover:scale-105 shadow-lg"
                >
                  <TranslatableText>Get Started</TranslatableText>
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-3">
              <LanguageSelector />
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-white hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden mt-4 pb-4 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
              <nav className="flex flex-col space-y-3 p-4">
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                  className="py-3 px-4 text-white border border-white/30 rounded-xl font-medium transition-all duration-200 hover:bg-white/10 text-left"
                >
                  <TranslatableText>Sign In</TranslatableText>
                </button>
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                  className="py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-xl font-medium transition-all duration-200 hover:from-yellow-400 hover:to-orange-400 text-left"
                >
                  <TranslatableText>Get Started</TranslatableText>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default WelcomeHeader;
