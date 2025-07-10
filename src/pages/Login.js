import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import TranslatableText from "../components/TranslatableText";

const Login = () => {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const location = useLocation();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user is already logged in
  const from = location.state?.from?.pathname || "/home";
  if (user) {
    return <Navigate to={from} replace />;
  }

  // Handle form submission
  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    try {
      let result;
      if (isLoginMode) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, name);
      }

      if (!result.success) {
        setAuthError(result.error);
      }
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign in
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setAuthError("");

    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setAuthError(result.error);
      }
    } catch (error) {
      setAuthError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Header with logo and controls */}
      <motion.header
        className="w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 shadow-sm relative z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <motion.h1
            className="text-2xl font-bold text-yellow-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TranslatableText>ResQPortal</TranslatableText>
          </motion.h1>
          <motion.div
            className="flex items-center space-x-3"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* REMOVE: <LanguageSelector /> */}
          </motion.div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4 relative z-10">
        <motion.div
          className="relative w-full max-w-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-4 -right-4 w-64 h-64 bg-yellow-600 rounded-full opacity-20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-96 h-96 bg-yellow-700 rounded-full opacity-10 blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [360, 180, 0],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>

          {/* Login/Register Card */}
          <motion.div
            className="relative bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8 overflow-hidden"
            initial={{ y: 50, opacity: 0, rotateX: -15 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Animated welcome message */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <AnimatePresence mode="wait">
                <motion.h2
                  key={isLoginMode ? "login" : "signup"}
                  className="text-3xl font-bold mb-2 text-white"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                >
                  <TranslatableText>
                    {isLoginMode ? "Welcome Back" : "Join ResQPortal"}
                  </TranslatableText>
                </motion.h2>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.p
                  key={isLoginMode ? "login-desc" : "signup-desc"}
                  className="text-sm text-gray-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <TranslatableText>
                    {isLoginMode
                      ? "Sign in to access disaster management tools"
                      : "Create an account to get started"}
                  </TranslatableText>
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Animated error message */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    initial={{ x: -10 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    {authError}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated auth form */}
            <motion.form
              onSubmit={handleAuth}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <AnimatePresence>
                {!isLoginMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.label
                      className="block text-sm font-medium mb-1 text-gray-300"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <TranslatableText>Full Name</TranslatableText>
                    </motion.label>
                    <motion.input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg transition-all duration-300 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter your full name"
                      required={!isLoginMode}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 3px rgba(255, 193, 7, 0.1)",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <motion.label
                  className="block text-sm font-medium mb-1 text-gray-300"
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
                  <TranslatableText>Email</TranslatableText>
                </motion.label>
                <motion.input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg transition-all duration-300 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Enter your email"
                  required
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: "0 0 0 3px rgba(255, 193, 7, 0.1)",
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <motion.label
                  className="block text-sm font-medium mb-1 text-gray-300"
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                >
                  <TranslatableText>Password</TranslatableText>
                </motion.label>
                <motion.input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg transition-all duration-300 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Enter your password"
                  required
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: "0 0 0 3px rgba(255, 193, 7, 0.1)",
                  }}
                />
              </motion.div>

              {/* Animated submit button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px rgba(255, 193, 7, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <div className="relative z-10">
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <TranslatableText>
                        {isLoginMode ? "Signing In..." : "Creating Account..."}
                      </TranslatableText>
                    </motion.div>
                  ) : (
                    <TranslatableText>
                      {isLoginMode ? "Sign In" : "Create Account"}
                    </TranslatableText>
                  )}
                </div>
              </motion.button>
            </motion.form>

            {/* Animated divider */}
            <motion.div
              className="my-6 flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              <motion.div
                className="flex-1 border-t border-gray-600"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 1.5 }}
              />
              <motion.span
                className="px-4 text-sm text-gray-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.6 }}
              >
                <TranslatableText>or</TranslatableText>
              </motion.span>
              <motion.div
                className="flex-1 border-t border-gray-600"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 1.5 }}
              />
            </motion.div>

            {/* Animated Google sign in */}
            <motion.button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2.5 border rounded-lg font-medium transition-all duration-300 relative overflow-hidden border-gray-600 text-gray-300 hover:bg-gray-700"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.7 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
                borderColor: "#4285F4",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-green-50 opacity-0"
                whileHover={{ opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.8 }}
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </motion.svg>
              <span className="relative z-10">
                <TranslatableText>Continue with Google</TranslatableText>
              </span>
            </motion.button>

            {/* Animated toggle login/register */}
           <motion.p
  className="mt-6 text-center text-sm text-gray-400"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 1.9 }}
>
  <AnimatePresence mode="wait">
    <motion.span
      key={isLoginMode ? "login-text" : "signup-text"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {isLoginMode ? (
        <TranslatableText>Don't have an account?</TranslatableText>
      ) : (
        <TranslatableText>
          Already have an account?
        </TranslatableText>
      )}
    </motion.span>
  </AnimatePresence>{" "}
  <motion.button
    onClick={() => {
      setIsLoginMode(!isLoginMode);
      setAuthError("");
      setName("");
      setEmail("");
      setPassword("");
    }}
    className="font-medium text-yellow-500 hover:text-yellow-400 transition-colors duration-300 hover:underline relative"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <motion.div
      className="absolute inset-0 bg-yellow-500 opacity-0 rounded"
      whileHover={{ opacity: 0.1 }}
      transition={{ duration: 0.2 }}
    />
    <AnimatePresence mode="wait">
      <motion.span
        key={isLoginMode ? "signup-btn" : "signin-btn"}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
        className="relative z-10"
      >
        {isLoginMode ? (
          <TranslatableText>Sign up</TranslatableText>
        ) : (
          <TranslatableText>Sign in</TranslatableText>
        )}
      </motion.span>
    </AnimatePresence>
  </motion.button>
</motion.p>
            </motion.div>
          </motion.div>
        </main>
      </motion.div>
  );
};

export default Login;
