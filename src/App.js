import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Relocation from "./pages/Relocation";
import CommunityHelp from "./pages/communityHelp";
import Mitigation from "./pages/Mitigation";
import About from "./pages/About";
import Welcome from "./pages/Welcome";
import Donation from "./pages/Donation";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import TranslatorInitializer from "./components/TranslatorInitializer";

function App() {
  return (
    <TranslatorInitializer>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public routes - Welcome and Login pages */}
                <Route path="/" element={<Welcome />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/login" element={<Login />} />

                {/* Protected routes - All other pages require authentication */}
                <Route path="/home" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/relocation" element={
                  <ProtectedRoute>
                    <Relocation />
                  </ProtectedRoute>
                } />
                <Route path="/community-help" element={
                  <ProtectedRoute>
                    <CommunityHelp />
                  </ProtectedRoute>
                } />
                <Route path="/mitigation" element={
                  <ProtectedRoute>
                    <Mitigation />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                } />
                <Route path="/donation" element={
                  <ProtectedRoute>
                    <Donation />
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TranslatorInitializer>
  );
}

export default App;
