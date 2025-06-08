import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className="text-center">
          {/* Loading spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-yellow-300 rounded-full animate-ping mx-auto"></div>
          </div>
          
          {/* Loading text */}
          <h2 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Loading ResQTech
          </h2>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Checking authentication status...
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
