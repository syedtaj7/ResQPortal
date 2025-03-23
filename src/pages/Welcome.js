import React from "react";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  // Updated and expanded icon elements
  const iconElements = [
    // Existing icons...
    {
      svg: <path d="M12 21c-3.17 0-6.34-.77-9.25-2.31L1 18v-3.75L3.75 12 1 9.75V6l1.75-.69C5.66 3.77 8.83 3 12 3s6.34.77 9.25 2.31L23 6v3.75L20.25 12 23 14.25V18l-1.75.69C18.34 20.23 15.17 21 12 21z" />,
      top: "10%",
      left: "35%",
      rotation: "-5deg",
      color: "#EF4444" // red
    },
    // Add new scattered icons
    {
      svg: <path d="M19 14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H5C3.9 4 3 4.9 3 6v6c0 1.1.9 2 2 2h1v2h2v-2h8v2h2v-2h1zm-6-3H7V7h6v4zM5 13V7h2v6H5zm12 0h-2V7h2v6z" />,
      top: "15%",
      right: "25%",
      rotation: "15deg",
      color: "#3B82F6"
    },
    {
      svg: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v7h-2zm0 8h2v2h-2z" />,
      top: "75%",
      left: "15%",
      rotation: "-15deg",
      color: "#F59E0B"
    },
    {
      svg: <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />,
      top: "30%",
      right: "10%",
      rotation: "20deg",
      color: "#10B981"
    },
    {
      svg: <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />,
      bottom: "20%",
      right: "25%",
      rotation: "-10deg",
      color: "#8B5CF6"
    },
    {
      svg: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z" />,
      top: "45%",
      left: "5%",
      rotation: "8deg",
      color: "#EC4899"
    },
    {
      svg: <path d="M17.5 3H6.5C5.12 3 4 4.12 4 5.5v13C4 19.88 5.12 21 6.5 21h11c1.38 0 2.5-1.12 2.5-2.5v-13C20 4.12 18.88 3 17.5 3zM12 17.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 8.5 12 8.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" />,
      bottom: "15%",
      left: "40%",
      rotation: "-12deg",
      color: "#6366F1"
    },
    {
      svg: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z" />,
      top: "60%",
      right: "15%",
      rotation: "25deg",
      color: "#EF4444"
    },
    {
      svg: <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />,
      bottom: "30%",
      left: "20%",
      rotation: "-20deg",
      color: "#059669"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-50 to-yellow-50">
      <Header />

      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yellow-200 rounded-full filter blur-[80px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-yellow-300 rounded-full filter blur-[80px] opacity-20 animate-pulse delay-700" />
      </motion.div>

      {/* Animated icons */}
      {iconElements.map((icon, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{ 
            opacity: 0, 
            scale: 0, 
            rotate: -180,
            x: Math.random() * 100 - 50 // Random initial position
          }}
          animate={{ 
            opacity: 0.7, 
            scale: 1, 
            rotate: parseInt(icon.rotation),
            x: 0
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 12,
            delay: index * 0.1, // Staggered animation
            duration: 1.2
          }}
          whileHover={{ 
            scale: 1.2, 
            opacity: 1,
            rotate: parseInt(icon.rotation) + 360,
            transition: { 
              duration: 0.8,
              type: "spring",
              stiffness: 200
            }
          }}
          style={{
            top: icon.top,
            left: icon.left,
            right: icon.right,
            bottom: icon.bottom,
            zIndex: 1
          }}
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill={icon.color}
            className="drop-shadow-lg filter hover:drop-shadow-2xl transition-all duration-300"
          >
            {icon.svg}
          </svg>
        </motion.div>
      ))}

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-4 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.8
            }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
              ResQPortal
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            Empowering communities for effective disaster response and coordination
          </motion.p>

          <motion.div
            className="flex flex-col md:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-yellow-500 text-white rounded-xl font-medium shadow-lg hover:bg-yellow-600 transition-colors"
              onClick={() => navigate("/Home")}
            >
              Get Started
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
              Sign In
            </motion.button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default Welcome;
