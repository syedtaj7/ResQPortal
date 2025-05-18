import React from "react";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TranslatableText from "../components/TranslatableText";
import { useTheme } from "../contexts/ThemeContext";
// We're using TranslatableText directly, so we don't need useTranslation here

function Welcome() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-hidden w-full ${
        darkMode ? "bg-black text-white" : "bg-gray-100 text-gray-900"
      }`}
      style={{
        backgroundImage: `url('/resqbg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: darkMode ? "darken" : "lighten",
        backgroundColor: darkMode
          ? "rgba(0, 0, 0, 0.9)"
          : "rgba(255, 255, 255, 0.9)",
        backgroundAttachment: "fixed",
      }}
    >
      <Header />

      {/* Main content */}
      <main className="flex-grow flex items-center w-full px-4 sm:px-6 md:px-8 relative z-10 md:ml-48 pr-8 md:pr-16 lg:pr-32">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-8 py-12 px-4 md:px-8 lg:px-12 max-w-5xl">
          {/* Left side - Text content */}
          <motion.div
            className="lg:w-2/3 text-left max-w-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl sm:text-6xl font-bold mb-6 leading-tight text-yellow-500 dark:text-yellow-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <TranslatableText>ResQPortal</TranslatableText>
            </motion.h1>

            <motion.div
              className="text-lg sm:text-xl mb-8 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <TranslatableText as="p">
                Connect and live more safely. ResQPortal is a personal safety
                network that empowers you to protect yourself and the people and
                places you care about.
              </TranslatableText>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-yellow-500 text-white rounded-xl font-medium shadow-lg hover:bg-yellow-600 transition-colors"
                onClick={() => navigate("/Home")}
              >
                <TranslatableText>Get Started</TranslatableText>
                <motion.span
                  className="inline-block ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gray-800 text-white rounded-xl font-medium shadow-lg hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/community-help")}
              >
                <TranslatableText>Sign In</TranslatableText>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right side - Image */}
          <motion.div
            className="lg:w-1/3 flex justify-start items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="relative rounded-[40px] overflow-hidden shadow-2xl border-[8px] border-gray-900 mx-4 md:mx-8 lg:mx-0"
              style={{
                maxWidth: "260px",
                height: "auto",
                aspectRatio: "9/19",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                margin: "0 auto",
                marginRight: "auto",
                marginLeft: "0",
              }}
              initial={{ y: 20 }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              {/* Phone notch removed */}

              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 bg-transparent text-white px-4 pt-1.5 pb-1 flex items-center justify-between text-xs z-10">
                <div className="flex items-center w-16">
                  {/* Empty left side */}
                </div>
                <div className="flex items-center space-x-2">
                  {/* Signal indicators removed */}
                  <span className="font-medium">3:17</span>
                </div>
              </div>

              {/* Map interface */}
              <div className="w-full h-full bg-gray-100 flex flex-col">
                {/* App header */}
                <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      <TranslatableText>ResQPortal</TranslatableText>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <svg
                      className="w-5 h-5 text-gray-700 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </div>
                </div>

                {/* Map content */}
                <div className="flex-grow relative bg-sky-100 overflow-hidden">
                  {/* India map container */}
                  <div className="relative w-full h-full">
                    {/* India SVG map */}
                    <div className="w-full h-full flex items-center justify-center p-1 pb-12">
                      <img
                        src="/india.svg"
                        alt="India Map"
                        className="w-[95%] h-[95%] object-contain mt-[-20px]"
                        style={{
                          filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))",
                          transform: "scale(1.1)",
                        }}
                      />
                    </div>

                    {/* Overlay markers for danger zones */}
                    <div className="absolute top-[40%] left-[10%] w-8 h-8 rounded-full bg-red-500 bg-opacity-70 border-2 border-red-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-md">
                      <span className="text-white text-[8px] font-bold">
                        <TranslatableText>Gujarat</TranslatableText>
                      </span>
                    </div>

                    <div className="absolute top-[65%] left-[25%] w-8 h-8 rounded-full bg-red-500 bg-opacity-70 border-2 border-red-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-md">
                      <span className="text-white text-[8px] font-bold">
                        <TranslatableText>Kerala</TranslatableText>
                      </span>
                    </div>

                    <div className="absolute top-[48%] left-[55%] w-8 h-8 rounded-full bg-red-500 bg-opacity-70 border-2 border-red-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-md">
                      <span className="text-white text-[8px] font-bold">
                        <TranslatableText>Odisha</TranslatableText>
                      </span>
                    </div>

                    {/* Overlay markers for safe zones */}
                    <div className="absolute top-[40%] left-[35%] w-7 h-7 rounded-full bg-green-500 bg-opacity-70 border-2 border-green-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-md">
                      <span className="text-white text-[8px] font-bold">
                        <TranslatableText>MP</TranslatableText>
                      </span>
                    </div>

                    <div className="absolute top-[60%] left-[22%] w-7 h-7 rounded-full bg-green-500 bg-opacity-70 border-2 border-green-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-md">
                      <span className="text-white text-[8px] font-bold">
                        <TranslatableText>KA</TranslatableText>
                      </span>
                    </div>

                    <div className="absolute top-[49%] left-[25%] w-7 h-7 rounded-full bg-green-500 bg-opacity-70 border-2 border-green-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-md">
                      <span className="text-white text-[8px] font-bold">
                        <TranslatableText>MH</TranslatableText>
                      </span>
                    </div>

                    {/* Overlay markers for warning zones */}
                    <div className="absolute top-[25%] left-[43%] w-7 h-7 rounded-full bg-yellow-500 bg-opacity-70 border-2 border-yellow-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-md">
                      <span className="text-gray-800 text-[8px] font-bold">
                        <TranslatableText>UK</TranslatableText>
                      </span>
                    </div>

                    <div className="absolute top-[42%] left-[70%] w-7 h-7 rounded-full bg-yellow-500 bg-opacity-70 border-2 border-yellow-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-md">
                      <span className="text-gray-800 text-[8px] font-bold">
                        <TranslatableText>WB</TranslatableText>
                      </span>
                    </div>

                    {/* Current location marker */}
                    <div className="absolute top-[40%] left-[48%] w-3 h-3 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20 animate-pulse shadow-md">
                      <div className="w-5 h-5 rounded-full bg-blue-400 bg-opacity-30 absolute"></div>
                    </div>
                  </div>

                  {/* Map controls */}
                  <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
                    <div className="flex flex-col space-y-2">
                      <button className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-700 dark:text-gray-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </button>
                      <button className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-700 dark:text-gray-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-2 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 z-30">
                    <div className="text-xs font-semibold mb-1 text-gray-800 dark:text-white">
                      <TranslatableText>Map Legend</TranslatableText>
                    </div>
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <span className="text-xs text-gray-700 dark:text-gray-200">
                        <TranslatableText>Danger Zone</TranslatableText>
                      </span>
                    </div>
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span className="text-xs text-gray-700 dark:text-gray-200">
                        <TranslatableText>Warning Zone</TranslatableText>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-xs text-gray-700 dark:text-gray-200">
                        <TranslatableText>Safe Zone</TranslatableText>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom navigation */}
                <div className="bg-white dark:bg-gray-800 p-3 flex justify-around items-center border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-6 h-6 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="text-xs text-yellow-500 dark:text-yellow-400 font-medium">
                      <TranslatableText>Home</TranslatableText>
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-6 h-6 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      <TranslatableText>Map</TranslatableText>
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-6 h-6 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      <TranslatableText>Alerts</TranslatableText>
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-6 h-6 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      <TranslatableText>Helplines</TranslatableText>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Welcome;
