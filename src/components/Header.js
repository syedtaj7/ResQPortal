import React, { useState, useCallback, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import TranslatableText from "./TranslatableText";
import { useAuth } from "../contexts/AuthContext";

// Navigation items matching Google Maps style - moved outside component for performance
const NAVIGATION_ITEMS = [
  { path: "/", label: "Welcome", icon: "🏠" },
  { path: "/home", label: "Disasters", icon: "🌪️" },
  { path: "/relocation", label: "Relocation", icon: "📍" },
  { path: "/community-help", label: "Alerts", icon: "🚨" },
  { path: "/mitigation", label: "Mitigation", icon: "🛡️" },
  { path: "/about", label: "Helplines", icon: "📞" },
  { path: "/donation", label: "Donations", icon: "💝" },
];

const Header = React.memo(({ transparent = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const isActiveRoute = useCallback(
    (path) => {
      if (path === "/" && location.pathname === "/") return true;
      if (path !== "/" && location.pathname.startsWith(path)) return true;
      return false;
    },
    [location.pathname]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout, navigate]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize Google Translate
  useEffect(() => {
    const initializeGoogleTranslate = () => {
      if (window.google && window.google.translate) {
        // Initialize for desktop navbar
        const navbarElement = document.getElementById(
          "google_translate_element_navbar"
        );
        if (navbarElement && !navbarElement.hasChildNodes()) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,ta,te,kn,ml,mr,bn,gu,pa,ur,or,as",
              layout:
                window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element_navbar"
          );
        }

        // Initialize for mobile
        const mobileElement = document.getElementById(
          "google_translate_element_mobile"
        );
        if (mobileElement && !mobileElement.hasChildNodes()) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,ta,te,kn,ml,mr,bn,gu,pa,ur,or,as",
              layout:
                window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element_mobile"
          );
        }
      }
    };

    // Try to initialize immediately if Google Translate is already loaded
    initializeGoogleTranslate();

    // Also listen for the Google Translate script to load
    const checkGoogleTranslate = setInterval(() => {
      if (window.google && window.google.translate) {
        initializeGoogleTranslate();
        clearInterval(checkGoogleTranslate);
      }
    }, 100);

    return () => {
      clearInterval(checkGoogleTranslate);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] bg-transparent p-4">
      <div className="max-w-7xl mx-auto">
        <div className="md:bg-black/20 md:backdrop-blur-xl md:border md:border-white/20 md:rounded-full bg-transparent px-4 py-3 md:shadow-2xl">
          <div className="flex items-center justify-between gap-2 min-w-0">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <h1
                className="text-lg md:text-xl font-bold md:text-white text-gray-800 md:drop-shadow-lg cursor-pointer"
                onClick={() => navigate("/")}
              >
                <TranslatableText>ResQPortal</TranslatableText>
              </h1>
            </div>

            {/* Center Navigation Pills */}
            <nav className="hidden lg:flex flex-1 items-center justify-center space-x-4 bg-white/10 backdrop-blur-md rounded-full p-1.5 shadow-inner nav-container mx-4 min-w-0">
              {NAVIGATION_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`nav-pill relative px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center space-x-1 whitespace-nowrap flex-shrink-0 ${
                    isActiveRoute(item.path)
                      ? "bg-white/25 text-white shadow-lg nav-active backdrop-blur-sm border border-white/40"
                      : "text-white/80 hover:text-white hover:bg-white/15 hover:shadow-md hover:border hover:border-white/30"
                  }`}
                >
                  <span className="text-xs transition-transform duration-200 hover:scale-110 flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-medium text-xs">
                    <TranslatableText>{item.label}</TranslatableText>
                  </span>
                  {isActiveRoute(item.path) && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none animate-pulse" />
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="hidden lg:flex items-center space-x-3 ml-3 flex-shrink-0">
              {/* Google Translate Element */}
              <div className="flex items-center">
                <div
                  id="google_translate_element_navbar"
                  className="flex items-center"
                ></div>
              </div>

              {/* User Menu */}
              {user && (
                <div className="relative flex-shrink-0" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 text-white/80 hover:text-white hover:bg-white/15 border border-white/30 hover:border-white/50 bg-white/10 backdrop-blur-sm text-xs max-w-[140px]"
                  >
                    <User size={14} className="flex-shrink-0" />
                    <span className="text-xs font-medium truncate">
                      {userProfile?.name || user.email?.split("@")[0] || "User"}
                    </span>
                  </button>

                  {/* User dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border bg-gray-800 border-gray-700 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm border-b text-gray-300 border-gray-700">
                          <p className="font-medium">
                            {userProfile?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <LogOut size={16} />
                          <span>
                            <TranslatableText>Sign Out</TranslatableText>
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isOpen
                    ? "text-white bg-gray-800 border border-gray-600 hover:bg-gray-700"
                    : "text-white bg-gray-800/80 border border-gray-600/80 hover:bg-gray-700 hover:border-gray-500"
                }`}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden mt-4 pb-4 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
              <nav className="flex flex-col space-y-1 p-3">
                {NAVIGATION_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3 ${
                      isActiveRoute(item.path)
                        ? "bg-white/20 text-white shadow-sm border border-white/30"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:border hover:border-white/20"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>
                      <TranslatableText>{item.label}</TranslatableText>
                    </span>
                    {isActiveRoute(item.path) && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </NavLink>
                ))}

                {/* Mobile user info and logout */}
                {user && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="px-4 py-2 text-sm text-gray-300">
                      <p className="font-medium">
                        {userProfile?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <LogOut size={18} />
                      <span>
                        <TranslatableText>Sign Out</TranslatableText>
                      </span>
                    </button>
                  </div>
                )}

                {/* Google Translate for Mobile */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-center">
                      <div
                        id="google_translate_element_mobile"
                        className="flex items-center"
                      ></div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
