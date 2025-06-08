import React, { useState, useEffect } from "react";
import WelcomeHeader from "../components/WelcomeHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TranslatableText from "../components/TranslatableText";

function Welcome() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Real-time Disaster Monitoring",
      description: "Track disasters as they happen with live updates and alerts",
      icon: "🌪️",
      color: "from-red-500 to-orange-500"
    },
    {
      title: "Community Support Network",
      description: "Connect with volunteers and get help when you need it most",
      icon: "🤝",
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "Emergency Response Tools",
      description: "Access critical resources and evacuation routes instantly",
      icon: "🚨",
      color: "from-green-500 to-teal-500"
    }
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      <WelcomeHeader />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              background: `linear-gradient(45deg, ${
                i % 3 === 0 ? '#FFD700, #FFA500' :
                i % 3 === 1 ? '#FF6B6B, #FF8E53' :
                '#4ECDC4, #44A08D'
              })`,
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
            }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Grid Pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 h-full flex items-center justify-center px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">

          {/* Left Side - Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Logo and Brand */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
                ResQTech
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                <span className="text-gray-300">Disaster Management</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Reimagined
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Advanced AI-powered platform for real-time disaster monitoring,
                community coordination, and emergency response management.
              </p>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${feature.color} text-white shadow-lg`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                >
                  {feature.icon} {feature.title}
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl shadow-2xl relative overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  🚀 Get Started
                </span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/login")}
                className="px-8 py-4 border-2 border-gray-600 text-white font-bold rounded-xl hover:border-white transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  👤 Sign In
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Side - Interactive Dashboard Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Main Dashboard Card */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 shadow-2xl relative overflow-hidden"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Live Dashboard</h3>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-3 h-3 bg-green-500 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-green-400 text-sm font-medium">Live</span>
                </div>
              </div>

              {/* Feature Showcase */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${features[currentFeature].color} bg-opacity-20 border border-opacity-30`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{features[currentFeature].icon}</span>
                      <h4 className="text-lg font-bold text-white">{features[currentFeature].title}</h4>
                    </div>
                    <p className="text-gray-300 text-sm">{features[currentFeature].description}</p>
                  </div>

                  {/* Mock Data Visualization */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-400">24</div>
                      <div className="text-xs text-gray-400">Active Alerts</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">1.2K</div>
                      <div className="text-xs text-gray-400">Volunteers</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </motion.div>

            {/* Floating Cards */}
            <motion.div
              className="absolute -top-8 -left-8 bg-blue-500/20 backdrop-blur-xl rounded-2xl p-4 border border-blue-400/30"
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-blue-400 text-sm font-medium">🌍 Global Coverage</div>
            </motion.div>

            <motion.div
              className="absolute -bottom-8 -right-8 bg-purple-500/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-400/30"
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-purple-400 text-sm font-medium">⚡ Real-time Updates</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
