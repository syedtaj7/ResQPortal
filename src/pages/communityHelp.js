import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "../components/Header";
import { initializeApp } from "firebase/app";
import TranslatableText from "../components/TranslatableText";
import { useTheme } from "../contexts/ThemeContext";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  // signOut, // Removed - not used after sidebar removal
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  getFirestore,
  collection,
  // addDoc, // Removed - not used after form removal
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  setDoc,
  limit,
  getDoc,
} from "firebase/firestore";
// Removed Firebase Storage imports - not used after sidebar removal
// import {
//   getStorage,
//   ref,
//   uploadBytes,
//   getDownloadURL
// } from "firebase/storage";
// import imageCompression from "browser-image-compression"; // Removed - not used after form removal
// Removed DISASTER_CATEGORIES import - using simplified categories
import Footer from "../components/Footer";

const loadTensorFlow = async () => {
  if (window.tf && window.mobilenet) return;

  try {
    const script1 = document.createElement("script");
    script1.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";
    await new Promise((resolve, reject) => {
      script1.onload = resolve;
      script1.onerror = reject;
      document.head.appendChild(script1);
    });

    const script2 = document.createElement("script");
    script2.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet";
    await new Promise((resolve, reject) => {
      script2.onload = resolve;
      script2.onerror = reject;
      document.head.appendChild(script2);
    });
  } catch (error) {
    console.error("Failed to load TensorFlow:", error);
    throw new Error("Failed to load image processing libraries");
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyCvhf8pCWQySk2HGKPnbMnZ7HQiGuEYkOw",
  authDomain: "resqtech-da121.firebaseapp.com",
  projectId: "resqtech-da121",
  storageBucket: "resqtech-da121.firebasestorage.app",
  messagingSenderId: "35397966843",
  appId: "1:35397966843:web:56c8ccb3994a412971095e",
  measurementId: "G-HN15MLX4HZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const storage = getStorage(app); // Removed - not used after sidebar removal
const googleProvider = new GoogleAuthProvider();

// Weather API integration can be added here when needed

// Add these utility functions after Firebase initialization
// Removed unused getWeatherData function to resolve the error

// Removed INDIAN_STATES - not used after sidebar removal

// Add these styles near the top of your file, after imports
// Removed unused getGradientButtonStyle function

// Alert card styles are defined in the AlertCard component

// Removed unused mainContentStyle variable

// Removed inputStyle as we're now using inline styles with darkMode conditional

// Add after imports, before CommunityHelp function
const ImageModal = ({ imageUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full">
        <img
          src={imageUrl}
          alt="Enlarged view"
          className="w-full h-auto rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Add these animation styles at the top of your file
const fadeInUp = `animate-[fadeIn_0.5s_ease-out,slideUp_0.5s_ease-out]`;
const slideIn = `animate-[slideIn_0.3s_ease-out]`;

// Update the login container and styles
const getLoginContainerStyle = () => `
  min-h-[calc(100vh-4rem)]
  flex items-center justify-center
  px-4 sm:px-6 md:px-8
  py-8 sm:py-12
  bg-gradient-to-br from-dark-bg-secondary via-dark-bg-primary to-dark-bg-tertiary
  relative
  overflow-hidden
`;

const getFormCardStyle = () => `
  w-full
  max-w-[420px]
  mx-auto
  bg-dark-bg-secondary/90 border-gray-700
  backdrop-blur-xl
  rounded-2xl
  shadow-[0_8px_32px_rgba(0,0,0,0.08)]
  overflow-hidden
  border
  ${fadeInUp}
`;

// Removed unused volunteer data and components

// Enhanced Modern Alert Card Component
const ModernAlertCard = ({
  alert,
  onUpvote,
  onShare,
  onSave,
  onImageClick,
  isUpvoting,
  isSaved,
  currentUser,
}) => {
  const { darkMode } = useTheme();
  const hasUpvoted = alert.upvotedBy?.includes(currentUser?.uid);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case "high":
        return {
          gradient: "from-red-500 to-red-600",
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-800 dark:text-red-200",
          border: "border-red-200 dark:border-red-800",
          icon: "🚨",
          pulse: "animate-pulse",
        };
      case "moderate":
        return {
          gradient: "from-yellow-500 to-orange-500",
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          text: "text-yellow-800 dark:text-yellow-200",
          border: "border-yellow-200 dark:border-yellow-800",
          icon: "⚠️",
          pulse: "",
        };
      case "low":
        return {
          gradient: "from-green-500 to-green-600",
          bg: "bg-green-50 dark:bg-green-900/20",
          text: "text-green-800 dark:text-green-200",
          border: "border-green-200 dark:border-green-800",
          icon: "ℹ️",
          pulse: "",
        };
      default:
        return {
          gradient: "from-blue-500 to-blue-600",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          text: "text-blue-800 dark:text-blue-200",
          border: "border-blue-200 dark:border-blue-800",
          icon: "📢",
          pulse: "",
        };
    }
  };

  const getCategoryConfig = (category) => {
    const configs = {
      "Natural Disasters": { icon: "🌪️", color: "from-red-500 to-orange-500" },
      "Medical Emergency": { icon: "🏥", color: "from-red-600 to-pink-600" },
      "Fire Emergency": { icon: "🔥", color: "from-red-500 to-yellow-500" },
      "Security Issues": { icon: "🚨", color: "from-blue-600 to-purple-600" },
      Infrastructure: { icon: "🏗️", color: "from-gray-600 to-blue-600" },
      Environmental: { icon: "🌱", color: "from-green-500 to-teal-500" },
    };
    return (
      configs[category] || { icon: "📢", color: "from-blue-500 to-purple-600" }
    );
  };

  const severityConfig = getSeverityConfig(alert.severity || "low");
  const categoryConfig = getCategoryConfig(alert.category);
  const timeAgo = alert.timestamp?.toDate
    ? getTimeAgo(alert.timestamp.toDate())
    : "Recently";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:rotate-1 ${
        darkMode
          ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50"
          : "bg-white/90 backdrop-blur-sm border border-gray-200/50"
      } shadow-lg hover:shadow-2xl hover:shadow-blue-500/10`}
    >
      {/* Animated Severity Indicator */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${severityConfig.gradient} ${severityConfig.pulse}`}
      ></div>

      {/* Floating Elements */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {/* Severity Badge */}
        <div
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${severityConfig.bg} ${severityConfig.text} ${severityConfig.border} border backdrop-blur-sm`}
        >
          <span>{severityConfig.icon}</span>
          <TranslatableText>{alert.severity || "low"}</TranslatableText>
        </div>

        {/* Volunteer Badge */}
        {alert.postedByVolunteer && (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <TranslatableText>Verified</TranslatableText>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Enhanced Header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${categoryConfig.color} flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
          >
            {categoryConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3
                className={`font-bold text-xl truncate ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <TranslatableText>{alert.category}</TranslatableText>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span
                className={`font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <TranslatableText>{alert.location}</TranslatableText>
                {alert.state && `, ${alert.state}`}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <svg
                className="w-3 h-3 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span
                className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}
              >
                {timeAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Image Display */}
        {alert.imageUrl && (
          <div
            className="mb-6 relative overflow-hidden rounded-xl cursor-pointer group/image"
            onClick={() => onImageClick(alert.imageUrl)}
          >
            <img
              src={alert.imageUrl}
              alt="Alert"
              className="w-full h-56 object-cover transition-all duration-500 group-hover/image:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-medium">
                    Click to view full image
                  </span>
                  <svg
                    className="w-5 h-5"
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
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Description */}
        <div
          className={`mb-6 p-4 rounded-xl ${
            darkMode ? "bg-gray-700/30" : "bg-gray-50"
          }`}
        >
          <p
            className={`text-sm leading-relaxed ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <TranslatableText>{alert.description}</TranslatableText>
          </p>
        </div>

        {/* Enhanced Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {/* Enhanced Upvote Button */}
            <button
              onClick={onUpvote}
              disabled={isUpvoting}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                hasUpvoted
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${isUpvoting ? "animate-pulse" : ""}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm font-semibold">
                {alert.upvotes || 0}
              </span>
            </button>

            {/* Enhanced Save Button */}
            <button
              onClick={onSave}
              className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isSaved
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-yellow-400"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-yellow-600"
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
            </button>

            {/* Enhanced Share Button */}
            <button
              onClick={onShare}
              className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-blue-400"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-blue-600"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {alert.userName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <span
              className={`text-xs font-medium ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {alert.userName || "Anonymous"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

function CommunityHelp() {
  const { darkMode } = useTheme();

  // Add effect to load TensorFlow
  useEffect(() => {
    loadTensorFlow().catch(console.error);
  }, []);

  // State management
  // const [isProcessing, setIsProcessing] = useState(false); // Removed - not used after sidebar removal
  const [user, loading] = useAuthState(auth);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alerts, setAlerts] = useState([]);
  // const [imageFile, setImageFile] = useState(null); // Removed - not used after form removal
  // const [imagePreview, setImagePreview] = useState(null); // Removed - not used after sidebar removal
  // const [isUploading, setIsUploading] = useState(false); // Removed - not used after form removal
  // const [description, setDescription] = useState(""); // Removed - not used after form removal
  // const [location, setLocation] = useState(""); // Removed - not used after form removal
  const [upvotingId, setUpvotingId] = useState(null);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [selectedCategory, setSelectedCategory] = useState(""); // Removed - not used after form removal
  // Removed selectedIncident - simplified to category only
  const [selectedImage, setSelectedImage] = useState(null);
  // const [selectedState, setSelectedState] = useState(""); // Removed - not used after sidebar removal
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterSeverity, setFilterSeverity] = useState("all");
  // const [formSeverity, setFormSeverity] = useState(""); // Removed - not used after form removal
  const [userProfile, setUserProfile] = useState(null);

  // Fetch alerts from Firebase
  const fetchAlerts = useCallback(async () => {
    try {
      const alertsRef = collection(db, "alerts");
      const q = query(alertsRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      const alertsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAlerts(alertsData);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  }, []);

  // Load alerts on component mount
  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user, fetchAlerts]);

  // Removed getCurrentLocation function - not used after form removal

  // Enhanced Modern Tabs Component
  const ModernTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
      {
        id: "feed",
        label: "Community Feed",
        icon: "🌐",
        count: alerts.length,
        description: "View all community reports",
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        id: "my-posts",
        label: "My Reports",
        icon: "📝",
        count: alerts.filter((a) => a.userId === user?.uid).length,
        description: "Your submitted reports",
        gradient: "from-purple-500 to-pink-500",
      },
      {
        id: "saved",
        label: "Saved",
        icon: "💾",
        count: 0,
        description: "Bookmarked alerts",
        gradient: "from-yellow-500 to-orange-500",
      },
      {
        id: "volunteer",
        label: "Volunteer",
        icon: "🤝",
        count: null,
        description: "Join our volunteer program",
        gradient: "from-green-500 to-teal-500",
      },
    ];

    return (
      <div className="mb-8">
        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 min-h-[60px] md:min-h-0 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl shadow-blue-500/25`
                  : darkMode
                  ? "bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:bg-gray-700/70 border border-gray-700/50"
                  : "bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-gray-200/50 shadow-lg"
              }`}
            >
              {/* Background Glow Effect */}
              {activeTab === tab.id && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-2xl blur-xl opacity-30 -z-10 animate-pulse`}
                ></div>
              )}

              {/* Icon with Animation */}
              <div
                className={`text-lg md:text-2xl transition-transform duration-300 ${
                  activeTab === tab.id ? "scale-110" : "group-hover:scale-110"
                }`}
              >
                {tab.icon}
              </div>

              {/* Label and Count Container */}
              <div className="flex flex-col items-center md:items-start flex-1 min-w-0">
                <span className="text-sm font-bold text-center md:text-left">
                  <TranslatableText>{tab.label}</TranslatableText>
                </span>
                <span
                  className={`text-xs opacity-75 text-center md:text-left ${
                    activeTab === tab.id
                      ? "text-white/80"
                      : darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  <TranslatableText>{tab.description}</TranslatableText>
                </span>
              </div>

              {/* Count Badge */}
              {tab.count !== null && (
                <div
                  className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  }`}
                >
                  {tab.count}
                </div>
              )}

              {/* Active Indicator */}
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Indicator */}
        <div
          className={`p-4 rounded-xl ${
            darkMode
              ? "bg-gray-800/30 border border-gray-700/50"
              : "bg-gray-50/50 border border-gray-200/50"
          } backdrop-blur-sm`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-r ${
                tabs.find((t) => t.id === activeTab)?.gradient ||
                "from-blue-500 to-purple-600"
              } flex items-center justify-center text-white font-bold text-sm`}
            >
              {tabs.find((t) => t.id === activeTab)?.icon}
            </div>
            <div>
              <h3
                className={`font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <TranslatableText>
                  {tabs.find((t) => t.id === activeTab)?.label}
                </TranslatableText>
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <TranslatableText>
                  {tabs.find((t) => t.id === activeTab)?.description}
                </TranslatableText>
              </p>
            </div>
            {tabs.find((t) => t.id === activeTab)?.count !== null && (
              <div className="ml-auto">
                <span
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tabs.find((t) => t.id === activeTab)?.count}
                </span>
                <span
                  className={`text-sm ml-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  items
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Modern Filter Bar
  const ModernFilterBar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");

    const categories = [
      "Natural Disasters",
      "Medical Emergency",
      "Fire Emergency",
      "Security Issues",
      "Infrastructure",
      "Environmental",
    ];

    const clearAllFilters = () => {
      setSearchQuery("");
      setSortBy("latest");
      setFilterSeverity("all");
      setCategoryFilter("all");
      setDateFilter("all");
    };

    const hasActiveFilters =
      searchQuery ||
      sortBy !== "latest" ||
      filterSeverity !== "all" ||
      categoryFilter !== "all" ||
      dateFilter !== "all";

    return (
      <div
        className={`rounded-2xl mb-8 overflow-hidden transition-all duration-500 ${
          darkMode
            ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
            : "bg-white/50 backdrop-blur-sm border border-gray-200/50"
        } shadow-xl`}
      >
        {/* Main Filter Row */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Enhanced Search */}
            <div className="md:col-span-2 relative">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
                <input
                  type="text"
                  placeholder="Search alerts, locations, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all duration-300 ${
                    searchQuery
                      ? "border-blue-500 ring-4 ring-blue-500/20"
                      : darkMode
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
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
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-4 py-4 rounded-xl border-2 appearance-none cursor-pointer transition-all duration-300 ${
                  sortBy !== "latest"
                    ? "border-purple-500 ring-4 ring-purple-500/20"
                    : darkMode
                    ? "bg-gray-700/50 border-gray-600 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    : "bg-white/80 border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                }`}
              >
                <option value="latest">🕒 Latest First</option>
                <option value="oldest">⏰ Oldest First</option>
                <option value="upvotes">⭐ Most Upvoted</option>
                <option value="severity">🚨 By Severity</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className={`w-full px-4 py-4 rounded-xl border-2 appearance-none cursor-pointer transition-all duration-300 ${
                  filterSeverity !== "all"
                    ? "border-red-500 ring-4 ring-red-500/20"
                    : darkMode
                    ? "bg-gray-700/50 border-gray-600 text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "bg-white/80 border-gray-300 text-gray-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                }`}
              >
                <option value="all">🎯 All Severities</option>
                <option value="high">🚨 High Priority</option>
                <option value="moderate">⚠️ Moderate</option>
                <option value="low">ℹ️ Low Priority</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                darkMode
                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
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
              <span>Advanced Filters</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
              >
                <svg
                  className="w-4 h-4"
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
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters (Expandable) */}
        {isExpanded && (
          <div
            className={`border-t px-6 py-4 ${
              darkMode
                ? "border-gray-700 bg-gray-800/30"
                : "border-gray-200 bg-gray-50/30"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Category Filter
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div
            className={`border-t px-6 py-3 ${
              darkMode
                ? "border-gray-700 bg-gray-800/20"
                : "border-gray-200 bg-gray-50/20"
            }`}
          >
            <div className="flex flex-wrap gap-2">
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Active filters:
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {sortBy !== "latest" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Sort: {sortBy}
                  <button
                    onClick={() => setSortBy("latest")}
                    className="ml-1 hover:text-purple-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterSeverity !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Severity: {filterSeverity}
                  <button
                    onClick={() => setFilterSeverity("all")}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Update handleGoogleSignIn function
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setAuthError("");

      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
        });
        setUserProfile(userDoc.data());
      } else {
        await setDoc(userRef, {
          name: result.user.displayName,
          email: result.user.email,
          lastLogin: serverTimestamp(),
          isVolunteer: false,
        });
      }
    } catch (error) {
      console.error("Google auth error:", error);
      setAuthError(
        error.code === "auth/popup-closed-by-user"
          ? "Sign-in cancelled. Please try again."
          : error.code === "auth/popup-blocked"
          ? "Popup was blocked. Please allow popups for this site."
          : "Failed to sign in with Google. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleAuth function with better error handling
  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    try {
      if (isLoginMode) {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Check if email already exists before creating account
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.length > 0) {
            setAuthError(
              "An account with this email already exists. Please sign in instead."
            );
            return;
          }
        } catch (error) {
          console.error("Error checking email:", error);
        }

        // Create new user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Add user to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      let errorMessage = "Authentication failed. Please try again.";

      switch (error.code) {
        case "auth/invalid-credential":
          errorMessage =
            "Invalid email or password. Please check your credentials.";
          break;
        case "auth/email-already-in-use":
          errorMessage =
            "This email is already registered. Please sign in instead.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters long.";
          break;
        case "auth/user-not-found":
          errorMessage =
            "No account found with this email. Please register first.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = "Authentication failed. Please try again.";
          break;
      }

      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch alerts data
  useEffect(() => {
    if (!user) return;

    const alertsRef = collection(db, "alerts");
    const unsubscribe = onSnapshot(
      query(alertsRef, orderBy("timestamp", "desc"), limit(50)),
      (snapshot) => {
        const alertsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAlerts(alertsData);
      },
      (error) => {
        console.error("Error fetching alerts:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Removed handleImageChange function - not used after sidebar removal

  // Removed handleSubmitAlert function - not used after sidebar removal

  const handleUpvote = async (alertId) => {
    if (!user) return;

    try {
      setUpvotingId(alertId);
      const alertRef = doc(db, "alerts", alertId);
      const alert = alerts.find((a) => a.id === alertId);
      const hasUpvoted = alert.upvotedBy?.includes(user.uid);

      await updateDoc(alertRef, {
        upvotes: hasUpvoted ? alert.upvotes - 1 : alert.upvotes + 1,
        upvotedBy: hasUpvoted ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });

      // Update local state
      setAlerts(
        alerts.map((alert) => {
          if (alert.id === alertId) {
            return {
              ...alert,
              upvotes: hasUpvoted ? alert.upvotes - 1 : alert.upvotes + 1,
              upvotedBy: hasUpvoted
                ? alert.upvotedBy.filter((id) => id !== user.uid)
                : [...(alert.upvotedBy || []), user.uid],
            };
          }
          return alert;
        })
      );
    } catch (error) {
      console.error("Error updating upvote:", error);
    } finally {
      setUpvotingId(null);
    }
  };

  // Add to CommunityHelp component
  const handleShare = async (alert) => {
    try {
      await navigator.share({
        title: `${alert.category} Alert in ${alert.location}`,
        text: alert.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Update the handleSaveAlert function
  const handleSaveAlert = async (alertItem) => {
    if (!user) {
      window.alert("Please sign in to save alerts");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);

      // Get current user data
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};
      const currentSavedAlerts = userData.savedAlerts || [];
      const isAlreadySaved = currentSavedAlerts.includes(alertItem.id);

      if (isAlreadySaved) {
        // Remove from saved alerts
        await updateDoc(userRef, {
          savedAlerts: arrayRemove(alertItem.id),
        });

        // Update local state - removed setTabsData as it's not defined

        window.alert("Alert removed from saved");
      } else {
        // Add to saved alerts
        await updateDoc(userRef, {
          savedAlerts: arrayUnion(alertItem.id),
        });

        // Update local state - removed setTabsData as it's not defined

        window.alert("Alert saved successfully");
      }
    } catch (error) {
      console.error("Error saving alert:", error);
      window.alert("Failed to save alert. Please try again.");
    } finally {
      // Removed setIsTabLoading as it's not defined
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Modern filtered alerts logic
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    // Filter by tab
    if (activeTab === "my-posts") {
      filtered = alerts.filter((alert) => alert.userId === user?.uid);
    } else if (activeTab === "saved") {
      // TODO: Implement saved alerts logic
      filtered = [];
    } else if (activeTab === "volunteer") {
      filtered = alerts.filter((alert) => alert.postedByVolunteer);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (alert) =>
          alert.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          alert.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply severity filter
    if (filterSeverity !== "all") {
      filtered = filtered.filter((alert) => alert.severity === filterSeverity);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            (a.timestamp?.toDate() || new Date()) -
            (b.timestamp?.toDate() || new Date())
          );
        case "upvotes":
          return (b.upvotes || 0) - (a.upvotes || 0);
        case "severity":
          const severityOrder = { high: 3, moderate: 2, low: 1 };
          return (
            (severityOrder[b.severity] || 1) - (severityOrder[a.severity] || 1)
          );
        default: // latest
          return (
            (b.timestamp?.toDate() || new Date()) -
            (a.timestamp?.toDate() || new Date())
          );
      }
    });

    return filtered;
  }, [alerts, activeTab, user?.uid, searchQuery, filterSeverity, sortBy]);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    setUserProfile(userDoc.data());
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Modern main render
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <Header transparent={true} />

      {/* Modern Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse ${
            darkMode ? "bg-blue-500/10" : "bg-blue-500/5"
          }`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-700 ${
            darkMode ? "bg-purple-500/10" : "bg-purple-500/5"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse delay-1000 ${
            darkMode ? "bg-indigo-500/5" : "bg-indigo-500/3"
          }`}
        ></div>
      </div>

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-6 lg:px-8">
        {!user ? (
          // Login/Register container with responsive classes
          <div className={getLoginContainerStyle()}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-4 -right-4 w-64 h-64 bg-yellow-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-yellow-700 rounded-full opacity-10 blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className={getFormCardStyle()}>
              <div className="px-4 sm:px-8 py-6 sm:py-8">
                {/* Logo/Header Section with animation */}
                <div className="text-center space-y-3 mb-8">
                  <div className="inline-block p-3 bg-yellow-900/30 rounded-full animate-bounce">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 transform rotate-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                        className="animate-pulse"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-text-primary tracking-tight">
                    {isLoginMode ? (
                      <TranslatableText>Welcome Back</TranslatableText>
                    ) : (
                      <TranslatableText>Create Account</TranslatableText>
                    )}
                  </h2>
                  <p className="text-sm text-dark-text-secondary">
                    {isLoginMode ? (
                      <TranslatableText>
                        Sign in to access your account
                      </TranslatableText>
                    ) : (
                      <TranslatableText>
                        Join us to help your community
                      </TranslatableText>
                    )}
                  </p>
                </div>

                {/* Google Sign In Button with hover effect */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="group w-full flex items-center justify-center gap-3 px-4 py-2.5 sm:py-3
                    border border-gray-700 bg-dark-bg-tertiary text-dark-text-primary
                    rounded-xl
                    hover:bg-dark-bg-hover hover:border-yellow-700 hover:shadow-md
                    focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
                    transition-all duration-300 ease-out text-sm sm:text-base font-medium"
                >
                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                    viewBox="0 0 24 24"
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
                  </svg>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    <TranslatableText>Continue with Google</TranslatableText>
                  </span>
                </button>

                {/* Animated divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-dark-bg-secondary text-dark-text-secondary animate-pulse">
                      <TranslatableText>
                        or continue with email
                      </TranslatableText>
                    </span>
                  </div>
                </div>

                {/* Error Message with shake animation */}
                {authError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-900/20 border-red-800/30 animate-[shake_0.5s_ease-in-out] border">
                    <p className="text-sm text-red-400">{authError}</p>
                  </div>
                )}

                {/* Login Form with animated inputs */}
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className={slideIn}>
                    <label className="block text-sm font-medium text-dark-text-primary mb-1">
                      <TranslatableText>Email</TranslatableText>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 border bg-dark-bg-tertiary border-gray-700 text-dark-text-primary placeholder-gray-500 rounded-lg
                        focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                        transition-all duration-300 ease-out text-sm sm:text-base
                        hover:border-yellow-700"
                      placeholder="Enter your email" // This will be handled by browser translation
                      required
                    />
                  </div>

                  <div className={slideIn} style={{ animationDelay: "150ms" }}>
                    <label className="block text-sm font-medium text-dark-text-primary mb-1">
                      <TranslatableText>Password</TranslatableText>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 border bg-dark-bg-tertiary border-gray-700 text-dark-text-primary placeholder-gray-500 rounded-lg
                        focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                        transition-all duration-300 ease-out text-sm sm:text-base
                        hover:border-yellow-700"
                      placeholder="Enter your password" // This will be handled by browser translation
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 sm:py-3 px-4 bg-yellow-600 text-white rounded-lg
                      hover:bg-yellow-700 hover:shadow-lg transform hover:-translate-y-0.5
                      focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
                      transition-all duration-300 ease-out text-sm sm:text-base font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>
                          {isLoginMode ? (
                            <TranslatableText>Signing in...</TranslatableText>
                          ) : (
                            <TranslatableText>
                              Creating account...
                            </TranslatableText>
                          )}
                        </span>
                      </div>
                    ) : (
                      <span>
                        {isLoginMode ? (
                          <TranslatableText>Sign in</TranslatableText>
                        ) : (
                          <TranslatableText>Create account</TranslatableText>
                        )}
                      </span>
                    )}
                  </button>
                </form>

                {/* Toggle Login/Register with animation */}
                <p className="mt-6 text-center text-sm text-dark-text-secondary">
                  {isLoginMode ? (
                    <TranslatableText>Don't have an account?</TranslatableText>
                  ) : (
                    <TranslatableText>
                      Already have an account?
                    </TranslatableText>
                  )}{" "}
                  <button
                    onClick={() => {
                      setIsLoginMode(!isLoginMode);
                      setAuthError("");
                    }}
                    className="font-medium text-yellow-500 hover:text-yellow-400 transition-colors duration-300 hover:underline transform hover:scale-105"
                  >
                    {isLoginMode ? (
                      <TranslatableText>Sign up</TranslatableText>
                    ) : (
                      <TranslatableText>Sign in</TranslatableText>
                    )}
                  </button>
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Modern main content area
          <div className="max-w-7xl mx-auto">
            {/* Modern Header */}
            <div className="text-center mb-12">
              <h1
                className={`text-4xl md:text-5xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <TranslatableText>Community Help Center</TranslatableText>
              </h1>
              <p
                className={`text-lg md:text-xl ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <TranslatableText>
                  Report incidents, help your community, and stay informed
                </TranslatableText>
              </p>
            </div>

            {/* Enhanced Report Form Section - Top Priority */}
            <div className="mb-12">
              <div
                className={`rounded-3xl p-8 ${
                  darkMode
                    ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50"
                    : "bg-white/90 backdrop-blur-sm border border-gray-200/50"
                } shadow-2xl`}
              >
                {/* Enhanced Form Header */}
                <div className="text-center mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl">🚨</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                  </div>
                  <h2
                    className={`text-3xl font-bold mb-3 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent`}
                  >
                    <TranslatableText>
                      Report Emergency Incident
                    </TranslatableText>
                  </h2>
                  <p
                    className={`text-lg ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <TranslatableText>
                      Help your community stay safe by reporting incidents
                      quickly and accurately
                    </TranslatableText>
                  </p>
                </div>

                {/* Enhanced Report Form removed - focusing on feed display */}

                {/* Emergency Contact Info */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`p-4 rounded-xl text-center ${
                        darkMode
                          ? "bg-red-900/20 border border-red-800"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="text-2xl mb-2">🚑</div>
                      <div
                        className={`font-bold ${
                          darkMode ? "text-red-300" : "text-red-800"
                        }`}
                      >
                        <TranslatableText>Medical Emergency</TranslatableText>
                      </div>
                      <div
                        className={`text-sm ${
                          darkMode ? "text-red-200" : "text-red-700"
                        }`}
                      >
                        Call 108
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-xl text-center ${
                        darkMode
                          ? "bg-orange-900/20 border border-orange-800"
                          : "bg-orange-50 border border-orange-200"
                      }`}
                    >
                      <div className="text-2xl mb-2">🔥</div>
                      <div
                        className={`font-bold ${
                          darkMode ? "text-orange-300" : "text-orange-800"
                        }`}
                      >
                        <TranslatableText>Fire Emergency</TranslatableText>
                      </div>
                      <div
                        className={`text-sm ${
                          darkMode ? "text-orange-200" : "text-orange-700"
                        }`}
                      >
                        Call 101
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-xl text-center ${
                        darkMode
                          ? "bg-blue-900/20 border border-blue-800"
                          : "bg-blue-50 border border-blue-200"
                      }`}
                    >
                      <div className="text-2xl mb-2">👮</div>
                      <div
                        className={`font-bold ${
                          darkMode ? "text-blue-300" : "text-blue-800"
                        }`}
                      >
                        <TranslatableText>Police Emergency</TranslatableText>
                      </div>
                      <div
                        className={`text-sm ${
                          darkMode ? "text-blue-200" : "text-blue-700"
                        }`}
                      >
                        Call 100
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Full Width Layout for Community Feed */}
            <div className="w-full">
              {/* Main Feed - Full width */}
              <div className="w-full space-y-8">
                {/* Modern Tabs */}
                <ModernTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Modern Filter Bar */}
                <ModernFilterBar />

                {/* Content Area with Enhanced Layout */}
                <div className="space-y-8">
                  {activeTab === "volunteer" ? (
                    <div
                      className={`p-8 rounded-2xl ${
                        darkMode
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-white border border-gray-200"
                      } shadow-xl`}
                    >
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">🤝</span>
                        </div>
                        <h2
                          className={`text-2xl font-bold mb-2 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          <TranslatableText>Volunteer Program</TranslatableText>
                        </h2>
                        <p
                          className={`${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <TranslatableText>
                            Join our community of verified volunteers
                          </TranslatableText>
                        </p>
                      </div>

                      {!userProfile?.isVolunteer ? (
                        <div className="space-y-4">
                          <div
                            className={`p-4 rounded-xl ${
                              darkMode
                                ? "bg-blue-900/20 border border-blue-800"
                                : "bg-blue-50 border border-blue-200"
                            }`}
                          >
                            <h3
                              className={`font-semibold mb-2 ${
                                darkMode ? "text-blue-300" : "text-blue-800"
                              }`}
                            >
                              <TranslatableText>
                                Benefits of becoming a volunteer:
                              </TranslatableText>
                            </h3>
                            <ul
                              className={`space-y-1 text-sm ${
                                darkMode ? "text-blue-200" : "text-blue-700"
                              }`}
                            >
                              <li>
                                •{" "}
                                <TranslatableText>
                                  Verified badge on your reports
                                </TranslatableText>
                              </li>
                              <li>
                                •{" "}
                                <TranslatableText>
                                  Priority visibility for your alerts
                                </TranslatableText>
                              </li>
                              <li>
                                •{" "}
                                <TranslatableText>
                                  Access to volunteer-only features
                                </TranslatableText>
                              </li>
                              <li>
                                •{" "}
                                <TranslatableText>
                                  Help coordinate community response
                                </TranslatableText>
                              </li>
                            </ul>
                          </div>
                          <button className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                            <TranslatableText>
                              Apply to Become a Volunteer
                            </TranslatableText>
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`p-6 rounded-xl text-center ${
                            darkMode
                              ? "bg-green-900/20 border border-green-800"
                              : "bg-green-50 border border-green-200"
                          }`}
                        >
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-white text-xl">✓</span>
                          </div>
                          <h3
                            className={`font-bold mb-2 ${
                              darkMode ? "text-green-300" : "text-green-800"
                            }`}
                          >
                            <TranslatableText>
                              Verified Volunteer
                            </TranslatableText>
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-green-200" : "text-green-700"
                            }`}
                          >
                            <TranslatableText>
                              You are registered as a verified volunteer! Your
                              reports will have priority visibility.
                            </TranslatableText>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : filteredAlerts.length > 0 ? (
                    <div className="grid gap-6">
                      {filteredAlerts.map((alert) => (
                        <ModernAlertCard
                          key={alert.id}
                          alert={alert}
                          onUpvote={() => handleUpvote(alert.id)}
                          onShare={() => handleShare(alert)}
                          onSave={() => handleSaveAlert(alert)}
                          onImageClick={() => handleImageClick(alert.imageUrl)}
                          isUpvoting={upvotingId === alert.id}
                          isSaved={false} // TODO: Implement saved logic
                          currentUser={user}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`text-center py-16 ${
                        darkMode
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-white border border-gray-200"
                      } rounded-2xl shadow-lg`}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📭</span>
                      </div>
                      <h3
                        className={`text-xl font-semibold mb-2 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {activeTab === "my-posts" ? (
                          <TranslatableText>No reports yet</TranslatableText>
                        ) : activeTab === "saved" ? (
                          <TranslatableText>No saved alerts</TranslatableText>
                        ) : (
                          <TranslatableText>No alerts found</TranslatableText>
                        )}
                      </h3>
                      <p
                        className={`${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {activeTab === "my-posts" ? (
                          <TranslatableText>
                            Start by reporting an incident to help your
                            community
                          </TranslatableText>
                        ) : activeTab === "saved" ? (
                          <TranslatableText>
                            Save important alerts to access them later
                          </TranslatableText>
                        ) : (
                          <TranslatableText>
                            Be the first to report an incident in your area
                          </TranslatableText>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar removed - feed now takes full width */}
          </div>
        )}
      </main>

      <Footer />

      {/* Image Modal with responsive sizing */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 p-4 md:p-8"
        />
      )}
    </div>
  );
}

export default CommunityHelp;
