import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Firebase configuration
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

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch user profile from Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            // Create user profile if it doesn't exist
            const newProfile = {
              name: firebaseUser.displayName || '',
              email: firebaseUser.email,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              isVolunteer: false,
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      const userRef = doc(db, 'users', result.user.uid);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: getErrorMessage(error.code) 
      };
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, name = '') => {
    try {
      // Check if email already exists
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        return {
          success: false,
          error: 'An account with this email already exists. Please sign in instead.'
        };
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        name: name || '',
        email: email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isVolunteer: false,
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: getErrorMessage(error.code) 
      };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user exists and get their data
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Update last login time
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
        });
      } else {
        // Create new user document
        await setDoc(userRef, {
          name: result.user.displayName || '',
          email: result.user.email,
          lastLogin: serverTimestamp(),
          isVolunteer: false,
        });
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: getErrorMessage(error.code) 
      };
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to sign out. Please try again.' 
      };
    }
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Popup was blocked. Please allow popups for this site.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    auth,
    db,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { auth, db };
