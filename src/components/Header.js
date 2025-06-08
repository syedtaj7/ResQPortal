import React, { useState, useCallback, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import TranslatableText from "./TranslatableText";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";
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
  const { darkMode } = useTheme();
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const isActiveRoute = useCallback((path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, navigate]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  return (
    <header className="w-full bg-transparent sticky top-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 shadow-2xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white drop-shadow-lg cursor-pointer"
                  onClick={() => navigate("/")}>
                <TranslatableText>ResQTech</TranslatableText>
              </h1>
            </div>

            {/* Center Navigation Pills */}
            <nav className="hidden lg:flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-full p-1 shadow-inner nav-container">
            {NAVIGATION_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-pill relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  isActiveRoute(item.path)
                    ? 'bg-white/20 text-white shadow-md nav-active backdrop-blur-sm border border-white/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-sm hover:border hover:border-white/20'
                }`}
              >
                <span className="text-base transition-transform duration-200 hover:scale-110">{item.icon}</span>
                <span className="font-medium"><TranslatableText>{item.label}</TranslatableText></span>
                {isActiveRoute(item.path) && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none animate-pulse" />
                )}
              </NavLink>
            ))}
          </nav>

            {/* Right side controls */}
            <div className="hidden lg:flex items-center space-x-3">
              <LanguageSelector />
              <ThemeToggle />

              {/* User Menu */}
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 text-white/80 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40"
                >
                  <User size={20} />
                  <span className="text-sm font-medium">
                    {userProfile?.name || user.email?.split('@')[0] || 'User'}
                  </span>
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  } z-50`}>
                    <div className="py-1">
                      <div className={`px-4 py-2 text-sm border-b ${
                        darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
                      }`}>
                        <p className="font-medium">{userProfile?.name || 'User'}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <LogOut size={16} />
                        <span><TranslatableText>Sign Out</TranslatableText></span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-2">
              <LanguageSelector />
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
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
                      ? 'bg-white/20 text-white shadow-sm border border-white/30'
                      : 'text-white/80 hover:text-white hover:bg-white/10 hover:border hover:border-white/20'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span><TranslatableText>{item.label}</TranslatableText></span>
                  {isActiveRoute(item.path) && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </NavLink>
              ))}

              {/* Mobile user info and logout */}
              {user && (
                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="font-medium">{userProfile?.name || 'User'}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${
                      darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <LogOut size={18} />
                    <span><TranslatableText>Sign Out</TranslatableText></span>
                  </button>
                </div>
              )}
            </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
