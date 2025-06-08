import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "../components/Header";
import { initializeApp } from "firebase/app";
import TranslatableText from "../components/TranslatableText";
import { useTheme } from "../contexts/ThemeContext";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  setDoc,
  where,
  limit,
  getDoc,
} from "firebase/firestore";
import imageCompression from "browser-image-compression";
import { DISASTER_CATEGORIES } from "../config/disasterCategories";
import { AlertTabs } from "../components/AlertTabs";
import { FilterBar } from "../components/FilterBar";
import { AlertCard } from "../components/AlertCard";
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
const googleProvider = new GoogleAuthProvider();

// Weather API integration can be added here when needed

// Add these utility functions after Firebase initialization
// Removed unused getWeatherData function to resolve the error

// Add this constant at the top of the file after imports
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Add these styles near the top of your file, after imports
const getGradientButtonStyle = () => `
  relative overflow-hidden
  bg-yellow-600
  text-white font-medium
  rounded-xl
  transition-all duration-300
  transform hover:scale-[1.02]
  hover:bg-yellow-700 focus:ring-yellow-500/50 focus:ring-offset-dark-bg-primary
  focus:outline-none focus:ring-2 focus:ring-offset-2
`;

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

// (Copy volunteerData and VolunteerRegistrationForm from Donation.js, or define a simple form here)
const volunteerData = [
  {
    id: 1,
    name: "General Volunteer Registration",
    skillsNeeded: [
      "Medical",
      "Construction",
      "Logistics",
      "Food Distribution",
      "Community Outreach",
    ],
  },
];

const VolunteerRegistrationForm = ({ user, onRegister }) => {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: [],
    availability: "",
    experience: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const availabilityOptions = [
    "Weekdays",
    "Weekends",
    "Evenings",
    "Full-time (1+ weeks)",
    "On-call (Emergency)",
  ];
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSkillChange = (skill) => {
    setFormData((prev) => {
      const updatedSkills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: updatedSkills };
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Save volunteer status in Firestore
    await setDoc(
      doc(db, "users", user.uid),
      { isVolunteer: true },
      { merge: true }
    );
    setIsSubmitting(false);
    setIsSubmitted(true);
    if (onRegister) onRegister();
  };
  if (isSubmitted) {
    return (
      <div
        className={`p-6 text-center ${
          darkMode ? "bg-dark-bg-secondary" : "bg-white"
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
            darkMode ? "bg-green-900/30" : "bg-green-100"
          } mb-4`}
        >
          <svg
            className={`h-6 w-6 ${
              darkMode ? "text-green-500" : "text-green-600"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3
          className={`text-lg font-medium ${
            darkMode ? "text-dark-text-primary" : "text-gray-900"
          } mb-2`}
        >
          <TranslatableText>Registration Successful!</TranslatableText>
        </h3>
        <p
          className={`text-sm ${
            darkMode ? "text-dark-text-secondary" : "text-gray-500"
          } mb-4`}
        >
          <TranslatableText>
            Thank you for registering as a volunteer. You can now report
            incidents as a volunteer.
          </TranslatableText>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${
        darkMode ? "bg-dark-bg-secondary" : "bg-white"
      } rounded-lg p-6 shadow-md`}
    >
      <div>
        <label
          className={`block text-sm font-medium ${
            darkMode ? "text-dark-text-primary" : "text-gray-700"
          }`}
        >
          <TranslatableText>Full Name</TranslatableText>
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md ${
            darkMode
              ? "bg-dark-bg-tertiary border-gray-700 text-dark-text-primary placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } shadow-sm`}
        />
      </div>
      <div>
        <label
          className={`block text-sm font-medium ${
            darkMode ? "text-dark-text-primary" : "text-gray-700"
          }`}
        >
          <TranslatableText>Email Address</TranslatableText>
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md ${
            darkMode
              ? "bg-dark-bg-tertiary border-gray-700 text-dark-text-primary placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } shadow-sm`}
        />
      </div>
      <div>
        <label
          className={`block text-sm font-medium ${
            darkMode ? "text-dark-text-primary" : "text-gray-700"
          }`}
        >
          <TranslatableText>Phone Number</TranslatableText>
        </label>
        <input
          type="tel"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md ${
            darkMode
              ? "bg-dark-bg-tertiary border-gray-700 text-dark-text-primary placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } shadow-sm`}
        />
      </div>
      <div>
        <label
          className={`block text-sm font-medium ${
            darkMode ? "text-dark-text-primary" : "text-gray-700"
          } mb-1`}
        >
          <TranslatableText>Skills (Select all that apply)</TranslatableText>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {volunteerData[0].skillsNeeded.map((skill) => (
            <div key={skill} className="flex items-center">
              <input
                id={`skill-${skill}`}
                type="checkbox"
                checked={formData.skills.includes(skill)}
                onChange={() => handleSkillChange(skill)}
                className={`h-4 w-4 ${
                  darkMode
                    ? "text-blue-500 focus:ring-blue-400 border-gray-700"
                    : "text-blue-600 focus:ring-blue-500 border-gray-300"
                } rounded`}
              />
              <label
                htmlFor={`skill-${skill}`}
                className={`ml-2 block text-sm ${
                  darkMode ? "text-dark-text-secondary" : "text-gray-700"
                }`}
              >
                <TranslatableText>{skill}</TranslatableText>
              </label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label
          className={`block text-sm font-medium ${
            darkMode ? "text-dark-text-primary" : "text-gray-700"
          }`}
        >
          <TranslatableText>Availability</TranslatableText>
        </label>
        <select
          name="availability"
          required
          value={formData.availability}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md ${
            darkMode
              ? "bg-dark-bg-tertiary border-gray-700 text-dark-text-primary"
              : "bg-white border-gray-300 text-gray-900"
          } shadow-sm`}
        >
          <option value="">
            <TranslatableText>Select your availability</TranslatableText>
          </option>
          {availabilityOptions.map((option) => (
            <option key={option} value={option}>
              <TranslatableText>{option}</TranslatableText>
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          className={`block text-sm font-medium ${
            darkMode ? "text-dark-text-primary" : "text-gray-700"
          }`}
        >
          <TranslatableText>Relevant Experience</TranslatableText>
        </label>
        <textarea
          name="experience"
          rows="2"
          value={formData.experience}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md ${
            darkMode
              ? "bg-dark-bg-tertiary border-gray-700 text-dark-text-primary placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } shadow-sm`}
        ></textarea>
      </div>
      <div>
        <label
          className={`block text-sm font-medium ${
            darkMode ? "text-dark-text-primary" : "text-gray-700"
          }`}
        >
          <TranslatableText>Additional Information (Optional)</TranslatableText>
        </label>
        <textarea
          name="message"
          rows="2"
          value={formData.message}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md ${
            darkMode
              ? "bg-dark-bg-tertiary border-gray-700 text-dark-text-primary placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } shadow-sm`}
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          darkMode
            ? "bg-blue-700 hover:bg-blue-800"
            : "bg-blue-500 hover:bg-blue-600"
        } ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
      >
        {isSubmitting ? (
          <TranslatableText>Processing...</TranslatableText>
        ) : (
          <TranslatableText>Register as Volunteer</TranslatableText>
        )}
      </button>
    </form>
  );
};

function CommunityHelp() {
  const { darkMode } = useTheme();

  // Add effect to load TensorFlow
  useEffect(() => {
    loadTensorFlow().catch(console.error);
  }, []);

  // Add missing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, loading] = useAuthState(auth);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [upvotingId, setUpvotingId] = useState(null);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIncident, setSelectedIncident] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedState, setSelectedState] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "latest",
    severity: "all",
  });
  const [tabsData, setTabsData] = useState({
    recent: [],
    "my-posts": [],
    saved: [],
  });
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Update handleGoogleSignIn function
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setAuthError("");

      // Configure Google provider
      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, googleProvider);

      // Check if user exists and get their data
      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Update last login time
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
        });
        // Set user profile with existing data
        setUserProfile(userDoc.data());
      } else {
        // Create new user document
        await setDoc(userRef, {
          name: result.user.displayName,
          email: result.user.email,
          lastLogin: serverTimestamp(),
          isVolunteer: false, // Initialize volunteer status
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

  // Update the useEffect for tab data
  useEffect(() => {
    if (!user) return;

    let unsubscribe = () => {};
    const fetchData = async () => {
      setIsTabLoading(true);
      try {
        const alertsRef = collection(db, "alerts");

        switch (activeTab) {
          case "recent":
            // Use real-time listener for recent tab
            unsubscribe = onSnapshot(
              query(alertsRef, orderBy("timestamp", "desc"), limit(20)),
              (snapshot) => {
                const recentAlerts = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                setTabsData((prev) => ({ ...prev, recent: recentAlerts }));
                setIsTabLoading(false);
              },
              (error) => {
                console.error("Error fetching recent alerts:", error);
                setIsTabLoading(false);
              }
            );
            break;

          case "my-posts":
            // Use real-time listener for my-posts tab
            unsubscribe = onSnapshot(
              query(
                alertsRef,
                where("userId", "==", user.uid),
                orderBy("timestamp", "desc")
              ),
              (snapshot) => {
                const myPosts = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                setTabsData((prev) => ({ ...prev, "my-posts": myPosts }));
                setIsTabLoading(false);
              },
              (error) => {
                console.error("Error fetching my posts:", error);
                setIsTabLoading(false);
              }
            );
            break;

          case "saved":
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const savedIds = userDoc.data()?.savedAlerts || [];
            const savedAlerts = await Promise.all(
              savedIds.map(async (id) => {
                const alertDoc = await getDoc(doc(alertsRef, id));
                if (alertDoc.exists()) {
                  return { id: alertDoc.id, ...alertDoc.data() };
                }
                return null;
              })
            );
            setTabsData((prev) => ({
              ...prev,
              saved: savedAlerts.filter((alert) => alert !== null),
            }));
            break;

          default:
            console.warn(`Unhandled tab type: ${activeTab}`);
            setTabsData((prev) => ({ ...prev }));
            setIsTabLoading(false);
            break;
        }
      } catch (error) {
        console.error("Error fetching tab data:", error);
      } finally {
        setIsTabLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [user, activeTab]);

  // Simplify handleImageChange function
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsProcessing(true);

      if (!file.type.startsWith("image/")) {
        throw new Error("Invalid file type. Please select an image.");
      }

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result;
        setImageFile(base64String);
        setImagePreview(base64String);
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error handling image:", error);
      alert(error.message || "Error processing image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Update handleSubmitAlert function
  const handleSubmitAlert = async (e) => {
    e.preventDefault();

    if (
      !imageFile ||
      !description ||
      !location ||
      !selectedCategory ||
      !selectedIncident
    ) {
      alert("Please fill in all fields and add an image");
      return;
    }

    try {
      setIsUploading(true);

      // Get user's volunteer status
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const isVolunteer = userData?.isVolunteer || false;

      const alertData = {
        imageUrl: imageFile,
        description,
        location,
        state: selectedState,
        category: selectedCategory,
        incidentType: selectedIncident,
        userId: user.uid,
        userEmail: user.email,
        timestamp: serverTimestamp(),
        upvotes: 0,
        upvotedBy: [],
        postedByVolunteer: isVolunteer,
      };

      await addDoc(collection(db, "alerts"), alertData);

      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setDescription("");
      setLocation("");
      setSelectedCategory("");
      setSelectedIncident("");

      window.alert("Alert submitted successfully");
    } catch (error) {
      console.error("Error creating alert:", error);
      window.alert("Failed to create alert. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

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
      setIsTabLoading(true);
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

        // Update local state
        setTabsData((prev) => ({
          ...prev,
          saved: prev.saved.filter((a) => a.id !== alertItem.id),
        }));

        window.alert("Alert removed from saved");
      } else {
        // Add to saved alerts
        await updateDoc(userRef, {
          savedAlerts: arrayUnion(alertItem.id),
        });

        // Update local state
        setTabsData((prev) => ({
          ...prev,
          saved: [...(prev.saved || []), alertItem],
        }));

        window.alert("Alert saved successfully");
      }
    } catch (error) {
      console.error("Error saving alert:", error);
      window.alert("Failed to save alert. Please try again.");
    } finally {
      setIsTabLoading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Add filter logic
  const filteredAlerts = useMemo(() => {
    const currentAlerts =
      activeTab === "recent"
        ? tabsData.recent || []
        : tabsData[activeTab] || [];

    return currentAlerts
      .filter((alert) => {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            alert.location.toLowerCase().includes(searchLower) ||
            alert.description.toLowerCase().includes(searchLower)
          );
        }
        if (filters.severity !== "all") {
          return alert.severity === filters.severity;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "upvotes") {
          return (b.upvotes || 0) - (a.upvotes || 0);
        }
        if (filters.sortBy === "severity") {
          const severityA = a.severity || "low";
          const severityB = b.severity || "low";
          return severityB.localeCompare(severityA);
        }
        return b.timestamp?.seconds || 0 - (a.timestamp?.seconds || 0);
      });
  }, [tabsData, activeTab, filters]);

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

  // Update the main container structure
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header transparent={true} />

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="relative z-10 pt-32 pb-16 px-4 md:px-6 lg:px-8">
        {" "}
        {/* Added responsive padding */}
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
          // Main content area with responsive grid
          <div
            className={`grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto ${
              darkMode ? "text-dark-text-primary" : "text-gray-900"
            }`}
          >
            {/* Alerts Feed - Takes full width on mobile, 2/3 on desktop */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="sticky top-4">
                <AlertTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  className="flex overflow-x-auto md:overflow-visible"
                />
                <FilterBar
                  filters={filters}
                  setFilters={setFilters}
                  className="mt-4 flex flex-col md:flex-row gap-2 md:gap-4"
                />

                {/* Alerts list with responsive spacing */}
                <div className="mt-4 space-y-4 md:space-y-6">
                  {isTabLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : activeTab === "volunteers" ? (
                    <div className="mt-6">
                      <h2
                        className={`text-xl font-bold mb-4 ${
                          darkMode ? "text-dark-text-primary" : "text-gray-900"
                        }`}
                      >
                        <TranslatableText>
                          Volunteer Registration
                        </TranslatableText>
                      </h2>
                      {!userProfile?.isVolunteer ? (
                        <VolunteerRegistrationForm
                          user={user}
                          onRegister={() => fetchUserProfile()}
                        />
                      ) : (
                        <div
                          className={`p-6 rounded-lg font-semibold shadow ${
                            darkMode
                              ? "bg-green-900/20 text-green-400"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          <TranslatableText>
                            You are registered as a volunteer! You can now
                            report incidents as a volunteer.
                          </TranslatableText>
                        </div>
                      )}
                    </div>
                  ) : filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onUpvote={() => handleUpvote(alert.id)}
                        onShare={() => handleShare(alert)}
                        onSave={() => handleSaveAlert(alert)}
                        onImageClick={() => handleImageClick(alert.imageUrl)}
                        isUpvoting={upvotingId === alert.id}
                        isSaved={user?.savedAlerts?.includes(alert.id)}
                        className="bg-dark-bg-secondary rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-dark-text-secondary">
                      {activeTab === "my-posts" ? (
                        <TranslatableText>
                          You haven't posted any alerts yet
                        </TranslatableText>
                      ) : activeTab === "saved" ? (
                        <TranslatableText>No saved alerts</TranslatableText>
                      ) : (
                        <TranslatableText>
                          No alerts found. Be the first to report an incident!
                        </TranslatableText>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Report Form - Takes full width on mobile, 1/3 on desktop */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div
                className={`${
                  darkMode
                    ? "bg-dark-bg-secondary border-gray-700"
                    : "bg-white border-gray-300"
                } border rounded-xl p-4 md:p-6 sticky top-4 ${
                  darkMode ? "shadow-lg shadow-black/20" : "shadow-md"
                }`}
              >
                <h2
                  className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <TranslatableText>Report Incident</TranslatableText>
                </h2>
                <form onSubmit={handleSubmitAlert} className="space-y-4">
                  {/* Location inputs with responsive grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label
                        className={`form-label font-medium ${
                          darkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        <TranslatableText>State *</TranslatableText>
                      </label>
                      <div className="select-wrapper">
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className={`custom-select ${
                            darkMode
                              ? "bg-dark-bg-secondary text-dark-text-primary border-gray-700 focus:border-blue-600 focus:ring-blue-600/25"
                              : "bg-white text-gray-700 border-gray-300 focus:border-blue-500 focus:ring-blue-500/25"
                          }`}
                          required
                        >
                          <option value="">
                            <TranslatableText>Select state</TranslatableText>
                          </option>
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              <TranslatableText>{state}</TranslatableText>
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label
                        className={`form-label font-medium ${
                          darkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        <TranslatableText>City/District *</TranslatableText>
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl ${
                          darkMode
                            ? "bg-dark-bg-secondary text-dark-text-primary border-gray-700 placeholder-gray-500 focus:border-blue-600 focus:ring-blue-600/25"
                            : "bg-white text-gray-700 border-gray-300 placeholder-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                        } border focus:ring-2 transition-all duration-300`}
                        placeholder="Enter city or district" // HTML attributes can't use TranslatableText directly
                        required
                      />
                    </div>
                  </div>

                  {/* Other form fields remain the same but with responsive padding/margins */}
                  {/* Incident Category */}
                  <div className="form-group">
                    <label
                      className={`form-label font-medium ${
                        darkMode ? "text-white" : "text-gray-700"
                      }`}
                    >
                      <TranslatableText>Incident Category *</TranslatableText>
                    </label>
                    <div className="select-wrapper">
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedIncident("");
                        }}
                        className={`custom-select ${
                          darkMode
                            ? "bg-dark-bg-secondary text-dark-text-primary border-gray-700 focus:border-blue-600 focus:ring-blue-600/25"
                            : "bg-white text-gray-700 border-gray-300 focus:border-blue-500 focus:ring-blue-500/25"
                        }`}
                        required
                      >
                        <option value="">
                          <TranslatableText>Select category</TranslatableText>
                        </option>
                        {Object.keys(DISASTER_CATEGORIES).map((category) => (
                          <option key={category} value={category}>
                            <TranslatableText>{category}</TranslatableText>
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specific Incident Dropdown */}
                  {selectedCategory && (
                    <div className="form-group">
                      <label
                        className={`form-label font-medium ${
                          darkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        <TranslatableText>Specific Incident *</TranslatableText>
                      </label>
                      <div className="select-wrapper">
                        <select
                          value={selectedIncident}
                          onChange={(e) => setSelectedIncident(e.target.value)}
                          className={`custom-select ${
                            darkMode
                              ? "bg-dark-bg-secondary text-dark-text-primary border-gray-700 focus:border-blue-600 focus:ring-blue-600/25"
                              : "bg-white text-gray-700 border-gray-300 focus:border-blue-500 focus:ring-blue-500/25"
                          }`}
                          required
                        >
                          <option value="">
                            <TranslatableText>
                              Select incident type
                            </TranslatableText>
                          </option>
                          {DISASTER_CATEGORIES[selectedCategory].map(
                            (incident) => (
                              <option
                                key={incident.value}
                                value={incident.value}
                              >
                                <TranslatableText>
                                  {incident.label}
                                </TranslatableText>
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Description Second */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-white" : "text-gray-700"
                      }`}
                    >
                      <TranslatableText>Description *</TranslatableText>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl ${
                        darkMode
                          ? "bg-dark-bg-secondary text-dark-text-primary border-gray-700 placeholder-gray-500 focus:border-blue-600 focus:ring-blue-600/25"
                          : "bg-white text-gray-700 border-gray-300 placeholder-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                      } border focus:ring-2 transition-all duration-300`}
                      rows="3"
                      placeholder="Describe the incident and current conditions" // HTML attributes can't use TranslatableText directly
                      required
                    />
                  </div>

                  {/* Image Upload Last */}
                  {location && description && (
                    <div>
                      <label
                        className={`
    w-full flex flex-col items-center px-4 py-6
    ${darkMode ? "bg-dark-bg-tertiary" : "bg-gray-100/50"} backdrop-blur-sm
    border-2 border-dashed ${darkMode ? "border-gray-600" : "border-gray-400"}
    rounded-xl
    cursor-pointer
    transition-all duration-300
    ${
      darkMode
        ? "hover:border-blue-600/70 hover:bg-dark-bg-hover"
        : "hover:border-blue-500/50 hover:bg-gray-200"
    }
    ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
  `}
                      >
                        {isProcessing ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <span
                              className={`mt-2 text-sm ${
                                darkMode
                                  ? "text-dark-text-primary"
                                  : "text-gray-900"
                              }`}
                            >
                              <TranslatableText>
                                Processing image...
                              </TranslatableText>
                            </span>
                          </div>
                        ) : !imageFile ? (
                          <>
                            <svg
                              className={`w-8 h-8 ${
                                darkMode
                                  ? "text-dark-text-primary"
                                  : "text-gray-900"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span
                              className={`mt-2 text-sm ${
                                darkMode
                                  ? "text-dark-text-primary"
                                  : "text-gray-900"
                              }`}
                            >
                              <TranslatableText>
                                Select an image that shows current conditions
                              </TranslatableText>
                            </span>
                          </>
                        ) : (
                          <div className="text-center">
                            <svg
                              className={`w-8 h-8 mx-auto ${
                                darkMode
                                  ? "text-dark-text-primary"
                                  : "text-gray-900"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span
                              className={`mt-2 text-sm ${
                                darkMode
                                  ? "text-dark-text-primary"
                                  : "text-gray-900"
                              }`}
                            >
                              <TranslatableText>
                                Image selected - Click to change
                              </TranslatableText>
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={!location || !description}
                        />
                      </label>

                      {imagePreview && (
                        <div className="mt-2 relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className={`absolute top-2 right-2 ${
                              darkMode ? "bg-red-800" : "bg-red-500"
                            } p-1 rounded-full ${
                              darkMode ? "hover:bg-red-900" : "hover:bg-red-600"
                            } transition-colors`}
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
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      isUploading || !imageFile || !location || !description
                    }
                    className={`${getGradientButtonStyle()} w-full py-2 md:py-3 text-sm md:text-base`}
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>
                          <TranslatableText>Processing...</TranslatableText>
                        </span>
                      </div>
                    ) : (
                      <TranslatableText>Submit Alert</TranslatableText>
                    )}
                  </button>
                </form>

                <button
                  onClick={() => signOut(auth)}
                  className="mt-4 w-full bg-red-800 px-4 py-2 md:py-3 rounded text-white hover:bg-red-900 transition-colors text-sm md:text-base"
                >
                  <TranslatableText>Logout</TranslatableText>
                </button>
              </div>
            </div>
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
