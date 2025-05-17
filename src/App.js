import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Relocation from "./pages/Relocation"; // Fix the import path
import CommunityHelp from "./pages/communityHelp";
import Mitigation from "./pages/Mitigation";
import About from "./pages/About";
import Welcome from "./pages/Welcome"; // Import the Welcome component
import Donation from "./pages/Donation"; // Import the Welcome component
import { LanguageProvider } from "./contexts/LanguageContext"; // Import the LanguageProvider
import { ThemeProvider } from "./contexts/ThemeContext"; // Import the ThemeProvider
import TranslatorInitializer from "./components/TranslatorInitializer"; // Import the TranslatorInitializer

function App() {
  return (
    <TranslatorInitializer>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Welcome />} />{" "}
              {/* Make Welcome the landing page */}
              <Route path="/welcome" element={<Welcome />} />{" "}
              {/* Ensure Welcome route */}
              <Route path="/home" element={<Home />} />{" "}
              {/* Change Home route */}
              <Route path="/relocation" element={<Relocation />} />
              <Route path="/community-help" element={<CommunityHelp />} />
              <Route path="/mitigation" element={<Mitigation />} />
              <Route path="/about" element={<About />} />
              <Route path="/donation" element={<Donation />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </TranslatorInitializer>
  );
}

export default App;
