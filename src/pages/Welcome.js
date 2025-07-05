import React, { useState, useEffect } from "react";
import WelcomeHeader from "../components/WelcomeHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TranslatableText from "../components/TranslatableText";
import GoogleVoiceAssistant from "../components/GoogleVoiceAssistant";
import disastersPageVideo from "../assets/videos/disasters-page.mp4";
import relocationPageVideo from "../assets/videos/Relocation-page.mp4";
import alertsPageVideo from "../assets/videos/Alerts-page.mp4";
import donationsPageVideo from "../assets/videos/Donations-page.mp4";
import helplinesPageVideo from "../assets/videos/Helplines-page.mp4";
import mitigationPageVideo from "../assets/videos/Mitigation-page.mp4";

function Welcome() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [selectedTab, setSelectedTab] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabsData = [
    {
      id: "disasters",
      title: "Disasters",
      icon: "�️",
      color: "from-red-500 to-orange-500",
      description:
        "Monitor and track real-time disaster events, view emergency alerts, and access critical disaster information and response protocols.",
      tags: ["Real-time Monitoring", "Emergency Alerts"],
      tagColors: [
        "bg-red-500/20 text-red-400",
        "bg-orange-500/20 text-orange-400",
      ],
      videoPlaceholder: "Disasters Page Navigation Guide",
      videoSrc: disastersPageVideo,
      hasVideo: true,
    },
    {
      id: "alerts",
      title: "Alerts",
      icon: "🚨",
      color: "from-blue-500 to-purple-500",
      description:
        "Receive real-time emergency alerts, notifications, and warnings. Stay informed about disasters, safety updates, and critical announcements in your area.",
      tags: ["Emergency Alerts", "Notifications"],
      tagColors: [
        "bg-blue-500/20 text-blue-400",
        "bg-purple-500/20 text-purple-400",
      ],
      videoPlaceholder: "Alerts & Notifications Guide",
      videoSrc: alertsPageVideo,
      hasVideo: true,
    },
    {
      id: "mitigation",
      title: "Mitigation",
      icon: "🛡️",
      color: "from-green-500 to-teal-500",
      description:
        "Access comprehensive disaster mitigation guides, safety protocols, and preventive measures. Get AI-powered recommendations based on your location and risk factors.",
      tags: ["Safety Guides", "AI Chatbot"],
      tagColors: [
        "bg-green-500/20 text-green-400",
        "bg-teal-500/20 text-teal-400",
      ],
      videoPlaceholder: "Mitigation Guides Tutorial",
      videoSrc: mitigationPageVideo,
      hasVideo: true,
    },
    {
      id: "relocation",
      title: "Relocation",
      icon: "🏃",
      color: "from-red-500 to-pink-500",
      description:
        "Find safe evacuation routes, emergency shelters, and transportation options during critical situations. Real-time updates on safe zones and traffic conditions.",
      tags: ["Evacuation Routes", "Safe Shelters"],
      tagColors: ["bg-red-500/20 text-red-400", "bg-pink-500/20 text-pink-400"],
      videoPlaceholder: "Emergency Relocation Guide",
      videoSrc: relocationPageVideo,
      hasVideo: true,
    },
    {
      id: "donation",
      title: "Donations",
      icon: "💝",
      color: "from-indigo-500 to-purple-500",
      description:
        "Make secure donations to disaster relief efforts, track fund allocation, and contribute to community recovery. Manage your volunteer activities and impact tracking.",
      tags: ["Secure Payments", "Impact Tracking"],
      tagColors: [
        "bg-indigo-500/20 text-indigo-400",
        "bg-purple-500/20 text-purple-400",
      ],
      videoPlaceholder: "Donation Platform Guide",
      videoSrc: donationsPageVideo,
      hasVideo: true,
    },
    {
      id: "helplines",
      title: "Helplines",
      icon: "📞",
      color: "from-cyan-500 to-blue-500",
      description:
        "Access emergency helplines, contact information for disaster response teams, and get immediate assistance during critical situations.",
      tags: ["Emergency Contacts", "24/7 Support"],
      tagColors: [
        "bg-cyan-500/20 text-cyan-400",
        "bg-blue-500/20 text-blue-400",
      ],
      videoPlaceholder: "Emergency Helplines Guide",
      videoSrc: helplinesPageVideo,
      hasVideo: true,
    },
  ];

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTab(null);
  };

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
      description:
        "Track disasters as they happen with live updates and alerts",
      icon: "🌪️",
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Community Support Network",
      description: "Connect with volunteers and get help when you need it most",
      icon: "🤝",
      color: "from-blue-500 to-purple-500",
    },
    {
      title: "Emergency Response Tools",
      description: "Access critical resources and evacuation routes instantly",
      icon: "🚨",
      color: "from-green-500 to-teal-500",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
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
                i % 3 === 0
                  ? "#FFD700, #FFA500"
                  : i % 3 === 1
                  ? "#FF6B6B, #FF8E53"
                  : "#4ECDC4, #44A08D"
              })`,
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
            }}
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1920),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1080),
            }}
            animate={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1920),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1080),
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
            backgroundSize: "50px 50px",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "50px 50px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 md:px-8 pt-24 md:pt-28 lg:pt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 lg:py-0">
          {/* Left Side - Content */}
          <motion.div
            className="space-y-6 md:space-y-8 text-center lg:text-left"
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
                ResQPortal
              </h1>
              <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto lg:mx-0"></div>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 md:mb-6">
                <span className="text-gray-300">Disaster Management</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Reimagined
                </span>
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Advanced AI-powered platform for real-time disaster monitoring,
                community coordination, and emergency response management.
              </p>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              className="flex flex-wrap gap-2 md:gap-3 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium bg-gradient-to-r ${feature.color} text-white shadow-lg`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                >
                  <span className="hidden sm:inline">{feature.icon} </span>
                  {feature.title}
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.button
                onClick={() => navigate("/login")}
                className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl shadow-2xl relative overflow-hidden group text-sm md:text-base"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🚀 <span>Get Started</span>
                </span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/login")}
                className="px-6 md:px-8 py-3 md:py-4 border-2 border-gray-600 text-white font-bold rounded-xl hover:border-white transition-all duration-300 relative overflow-hidden group text-sm md:text-base"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  👤 <span>Sign In</span>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Side - Interactive Dashboard Preview */}
          <motion.div
            className="relative mt-8 lg:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Main Dashboard Card */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-gray-700 shadow-2xl relative overflow-hidden"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                  Live Dashboard
                </h3>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-green-400 text-xs md:text-sm font-medium">
                    Live
                  </span>
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
                  <div
                    className={`p-3 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-r ${features[currentFeature].color} bg-opacity-20 border border-opacity-30`}
                  >
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                      <span className="text-xl md:text-2xl lg:text-3xl">
                        {features[currentFeature].icon}
                      </span>
                      <h4 className="text-sm md:text-base lg:text-lg font-bold text-white">
                        {features[currentFeature].title}
                      </h4>
                    </div>
                    <p className="text-gray-300 text-xs md:text-sm">
                      {features[currentFeature].description}
                    </p>
                  </div>

                  {/* Mock Data Visualization */}
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-3 md:p-4">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-yellow-400">
                        24
                      </div>
                      <div className="text-xs text-gray-400">Active Alerts</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3 md:p-4">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-400">
                        1.2K
                      </div>
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

            {/* Floating Cards - Hidden on mobile to prevent overlap */}
            <motion.div
              className="hidden lg:block absolute -top-8 -left-8 bg-blue-500/20 backdrop-blur-xl rounded-2xl p-4 border border-blue-400/30"
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-blue-400 text-sm font-medium">
                🌍 Global Coverage
              </div>
            </motion.div>

            <motion.div
              className="hidden lg:block absolute -bottom-8 -right-8 bg-purple-500/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-400/30"
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-purple-400 text-sm font-medium">
                ⚡ Real-time Updates
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Google Voice Emergency Assistant */}
      <GoogleVoiceAssistant />

      {/* How To Section */}
      <section className="relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              How to Use{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                ResQPortal
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Navigate through our comprehensive disaster management platform
              with these step-by-step guides
            </p>
          </motion.div>

          {/* How To Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {tabsData.map((tab, index) => (
              <motion.div
                key={tab.id}
                className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 hover:border-${
                  tab.color.split(" ")[1].split("-")[0]
                }-500/50 transition-all duration-300 group cursor-pointer`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                onClick={() => handleTabClick(tab)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${tab.color} rounded-lg flex items-center justify-center`}
                  >
                    <span className="text-2xl">{tab.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{tab.title}</h3>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {tab.description}
                </p>
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors">
                  <div className="text-center text-gray-400">
                    {tab.hasVideo ? (
                      <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden mb-2">
                        <video
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                          playsInline
                        >
                          <source src={tab.videoSrc} type="video/mp4" />
                        </video>
                      </div>
                    ) : (
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded-lg flex items-center justify-center group-hover:bg-gray-500 transition-colors">
                        🎥
                      </div>
                    )}
                    <p className="text-sm">Click to view full tutorial</p>
                    <p className="text-xs">{tab.videoPlaceholder}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tab.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className={`px-2 py-1 ${tab.tagColors[tagIndex]} text-xs rounded-full`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Features */}
          <motion.div
            className="mt-12 md:mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Additional Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-3xl mb-2">🎤</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Voice Assistant
                </h4>
                <p className="text-gray-400 text-sm">
                  Emergency voice commands and audio alerts for hands-free
                  operation
                </p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-3xl mb-2">🌐</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Multi-language Support
                </h4>
                <p className="text-gray-400 text-sm">
                  Access the platform in multiple languages for global
                  accessibility
                </p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-3xl mb-2">📱</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Mobile Optimized
                </h4>
                <p className="text-gray-400 text-sm">
                  Fully responsive design for use on any device, anywhere
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Tutorial Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTab && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            {" "}
            <motion.div
              className="md:bg-gray-900 md:rounded-2xl md:border md:border-gray-700 md:shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${selectedTab.color} rounded-lg flex items-center justify-center`}
                  >
                    <span className="text-2xl">{selectedTab.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedTab.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {selectedTab.videoPlaceholder}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-6 overflow-auto">
                {/* Video Section */}
                {selectedTab.hasVideo ? (
                  <div className="w-full">
                    <video
                      className="w-full h-auto max-h-[60vh] object-contain bg-black rounded-lg"
                      controls
                      preload="metadata"
                    >
                      <source src={selectedTab.videoSrc} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-600">
                    <div className="text-center text-gray-400">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-xl flex items-center justify-center">
                        <span className="text-4xl">🎥</span>
                      </div>
                      <h4 className="text-xl font-semibold mb-2">
                        Screen Recording Coming Soon
                      </h4>
                      <p className="text-gray-500 max-w-md mx-auto">
                        This section will contain a detailed tutorial video for
                        "{selectedTab.title}" functionality.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Welcome;
