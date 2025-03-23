import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import { initializeApp } from "firebase/app";
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
  getDocs,
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
const gradientButtonStyle = `
  relative overflow-hidden
  bg-yellow-300 
  text-black font-medium
  rounded-xl
  transition-all duration-300
  transform hover:scale-[1.02]
  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900
`;

// Update the alert card styles
const alertCardStyle = `
  bg-[#F8F8F8]/50 backdrop-blur-sm
  border border-gray-700/50
  rounded-xl p-6
  transform transition-all duration-300
  hover:border-yellow-500/30
  
`;

// Modify the main content area styling
const mainContentStyle = `
  flex-grow p-8 
  
`;

// Update form input styles
const inputStyle = `
  w-full px-4 py-3 
  bg-[#F8F8F8] 
  border border-gray-700 
  rounded-xl
  focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
  transition-all duration-300
  placeholder-gray-500
  text-gray-900
`; 

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

function CommunityHelp() {
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

      // Add user to Firestore if needed
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(
        userRef,
        {
          name: result.user.displayName,
          email: result.user.email,
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
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
            setAuthError("An account with this email already exists. Please sign in instead.");
            return;
          }
        } catch (error) {
          console.error("Error checking email:", error);
        }

        // Create new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Add user to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      let errorMessage = "Authentication failed. Please try again.";

      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = "Invalid email or password. Please check your credentials.";
          break;
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered. Please sign in instead.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password should be at least 6 characters long.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email. Please register first.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection.";
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

  // Update the useEffects for data fetching

  // 1. First, combine the two useEffects for tab data
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
                console.log("Recent alerts:", recentAlerts); // Add this debug log
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
            const myPostsQuery = query(
              alertsRef,
              where("userId", "==", user.uid),
              orderBy("timestamp", "desc")
            );
            const myPostsSnap = await getDocs(myPostsQuery);
            const myPosts = myPostsSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTabsData((prev) => ({ ...prev, "my-posts": myPosts }));
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

  // 2. Remove the duplicate useEffect for alerts
  // Remove this useEffect:
  // useEffect(() => {
  //   if (!user) return;
  //   const alertsRef = collection(db, 'alerts');
  //   const q = query(alertsRef, orderBy('timestamp', 'desc'));
  //   ...
  // }, [user]);

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
      };

      console.log("Creating alert with data:", alertData); // Add this debug log

      const docRef = await addDoc(collection(db, "alerts"), alertData);
      console.log("Alert created with ID:", docRef.id); // Add this debug log

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-white">
      {/* Header */}
      <Header />
      <main className={mainContentStyle}>
        {!user ? (
          <div className="min-h-screen flex items-center justify-center px-4 bg-white bg-auth-pattern">
            <div className="w-full max-w-md animate-slideUp ml-28">
              <div className="relative group">
                {/* Decorative elements */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

                <div className="relative px-8 py-10 bg-[#F8F8F8] ring-1 ring-gray-800/50 rounded-2xl backdrop-blur-xl">
                  {/* Header */}
                  <div className="text-center space-y-6 mb-8">
                    <div className="relative inline-block animate-float">
                      <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20"></div>
                      <svg
                        className="w-16 h-16 text-yellow-400 relative"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold">
                      <span className="bg-yellow-300 bg-clip-text text-transparent">
                        {isLoginMode ? "Welcome Back" : "Join ResQTech"}
                      </span>
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {isLoginMode
                        ? "Sign in to connect with your community"
                        : "Create an account to start helping others"}
                    </p>
                  </div>

                  {/* Social Login */}
                  <button
                    onClick={handleGoogleSignIn}
                    className="group relative w-full bg-[#F8F8F8] text-gray-900 rounded-xl p-3.5 font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-300"
                  >
                    <span className="absolute inset-0 w-3 bg-gradient-to-r from-yellow-500 to-yellow-500 rounded-xl transition-all duration-500 ease-out group-hover:w-full opacity-0 group-hover:opacity-20"></span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-[#F8F8F8] text-gray-500">
                        or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Error Message */}
                  {authError && (
                    <div className="mb-6 animate-shake">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-red-500 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-red-400 text-sm">{authError}</p>
                      </div>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleAuth} className="space-y-6 ">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 block ">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputStyle}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 block">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputStyle}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`${gradientButtonStyle} p-3`}
                    >
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 group-hover:transition-opacity"></span>
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>
                            {isLoginMode
                              ? "Signing in..."
                              : "Creating account..."}
                          </span>
                        </div>
                      ) : (
                        <span>
                          {isLoginMode ? "Sign in" : "Create account"}
                        </span>
                      )}
                    </button>
                  </form>

                  {/* Toggle Login/Register */}
                  <p className="mt-6 text-center text-sm text-gray-400">
                    {isLoginMode
                      ? "Don't have an account?"
                      : "Already have an account?"}{" "}
                    <button
                      onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setAuthError("");
                      }}
                      className="text-yellow-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      {isLoginMode ? "Register now" : "Sign in"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto md:ml-40">
            {/* Alerts Feed */}
            <div className="col-span-2">
              <AlertTabs activeTab={activeTab} setActiveTab={setActiveTab} />
              <FilterBar filters={filters} setFilters={setFilters} />

              {/* In the JSX where alerts are rendered */}
              <div className="space-y-6">
                {isTabLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <div className={alertCardStyle}>
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onUpvote={() => handleUpvote(alert.id)}
                        onShare={() => handleShare(alert)}
                        onSave={() => handleSaveAlert(alert)}
                        onImageClick={() => handleImageClick(alert.imageUrl)}
                        isUpvoting={upvotingId === alert.id}
                        isSaved={user?.savedAlerts?.includes(alert.id)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    {activeTab === "my-posts"
                      ? "You haven't posted any alerts yet"
                      : activeTab === "saved"
                      ? "No saved alerts"
                      : "No alerts found. Be the first to report an incident!"}
                  </div>
                )}
              </div>
            </div>

            {/* Report Form */}
            <div
              className="form-container"
              style={{ backgroundColor: "#F8F8F8", color: "black" }}
            >
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-black to-black">
                Report Incident
              </h2>
              <form onSubmit={handleSubmitAlert} className="space-y-4">
                {/* Location and State Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <div className="select-wrapper">
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="custom-select"
                        style={{ backgroundColor: "#F8F8F8", color: "gray" }}
                        required
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">City/District *</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={inputStyle}
                      placeholder="Enter city or district"
                      required
                    />
                  </div>
                </div>

                {/* Incident Category */}
                <div className="form-group">
                  <label className="form-label">Incident Category *</label>
                  <div className="select-wrapper">
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedIncident("");
                      }}
                      className="custom-select"
                      style={{ backgroundColor: "#F8F8F8", color: "gray" }}
                      required
                    >
                      <option value="">Select category</option>
                      {Object.keys(DISASTER_CATEGORIES).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Specific Incident Dropdown */}
                {selectedCategory && (
                  <div className="form-group">
                    <label className="form-label">Specific Incident *</label>
                    <div className="select-wrapper">
                      <select
                        value={selectedIncident}
                        onChange={(e) => setSelectedIncident(e.target.value)}
                        className="custom-select"
                        style={{ backgroundColor: "#F8F8F8" }}
                        required
                      >
                        <option value="">Select incident type</option>
                        {DISASTER_CATEGORIES[selectedCategory].map(
                          (incident) => (
                            <option key={incident.value} value={incident.value}>
                              {incident.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                )}

                {/* Description Second */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Describe the incident and current conditions"
                    style={{ backgroundColor: "#F8F8F8" }}
                    required
                  />
                </div>

                {/* Image Upload Last */}
                {location && description && (
                  <div>
                    <label
                      className={`
  w-full flex flex-col items-center px-4 py-6
  bg-[#F8F8F8]/50 backdrop-blur-sm
  border-2 border-dashed border-gray-600
  rounded-xl
  cursor-pointer
  transition-all duration-300
  hover:border-blue-500/50 hover:bg-gray-800/70
  ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
`}
                    >
                      {isProcessing ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          <span className="mt-2 text-sm">
                            Processing image...
                          </span>
                        </div>
                      ) : !imageFile ? (
                        <>
                          <svg
                            className="w-8 h-8"
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
                          <span className="mt-2 text-sm">
                            Select an image that shows current conditions
                          </span>
                        </>
                      ) : (
                        <div className="text-center">
                          <svg
                            className="w-8 h-8 mx-auto"
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
                          <span className="mt-2 text-sm">
                            Image selected - Click to change
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
                          className="absolute top-2 right-2 bg-red-500 p-1 rounded-full hover:bg-red-600 transition-colors"
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
                  className={`${gradientButtonStyle} w-full py-3 ${
                    isUploading || !imageFile || !location || !description
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Submit Alert"
                  )}
                </button>
              </form>

              <button
                onClick={() => signOut(auth)}
                className="mt-4 w-full bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

export default CommunityHelp;
