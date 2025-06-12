import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TranslatableText from "../components/TranslatableText";
import { useTheme } from "../contexts/ThemeContext";
import emailService from "../services/emailService";

function HomePage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Use the new contact email method
      const result = await emailService.sendContactEmail({
        name: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject,
        message: contactForm.message
      });

      if (result.status === 'success') {
        setSubmitStatus('success');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else if (result.status === 'simulated') {
        setSubmitStatus('simulated');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }

    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-red-600 opacity-90"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <TranslatableText>ResQTech</TranslatableText>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              <TranslatableText>
                Advanced Emergency Response & Disaster Management System for India
              </TranslatableText>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/home')}
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                <TranslatableText>Get Started</TranslatableText>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/about')}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                <TranslatableText>Learn More</TranslatableText>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-16 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              <TranslatableText>Key Features</TranslatableText>
            </h2>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              <TranslatableText>Comprehensive emergency management tools</TranslatableText>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🗺️",
                title: "Real-time Disaster Mapping",
                description: "Live tracking of disasters across India with interactive maps"
              },
              {
                icon: "🎤",
                title: "Voice Emergency Detection",
                description: "AI-powered voice recognition for emergency situations"
              },
              {
                icon: "📧",
                title: "Emergency Alerts",
                description: "Instant email notifications to emergency contacts"
              },
              {
                icon: "🏠",
                title: "Safe Location Finder",
                description: "Find nearby shelters and safe zones during emergencies"
              },
              {
                icon: "🤝",
                title: "Community Help",
                description: "Connect with local volunteers and emergency services"
              },
              {
                icon: "📱",
                title: "Mobile Responsive",
                description: "Access emergency tools from any device, anywhere"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`p-6 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-50"} hover:shadow-lg transition-shadow`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  <TranslatableText>{feature.title}</TranslatableText>
                </h3>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  <TranslatableText>{feature.description}</TranslatableText>
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-16 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              <TranslatableText>Contact Us</TranslatableText>
            </h2>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              <TranslatableText>Get in touch with our emergency response team</TranslatableText>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-xl p-8 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
          >
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <TranslatableText>Name</TranslatableText>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <TranslatableText>Email</TranslatableText>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <TranslatableText>Subject</TranslatableText>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="What is this regarding?"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <TranslatableText>Message</TranslatableText>
                </label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical`}
                  placeholder="Please describe your inquiry or feedback..."
                />
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  <TranslatableText>✅ Message sent successfully! We'll get back to you soon.</TranslatableText>
                </div>
              )}

              {submitStatus === 'simulated' && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
                  <TranslatableText>📧 Message simulated (EmailJS not configured). Your message was processed but not sent.</TranslatableText>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <TranslatableText>❌ Failed to send message. Please try again or contact us directly.</TranslatableText>
                </div>
              )}

              <div className="text-center">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  {isSubmitting ? (
                    <TranslatableText>Sending...</TranslatableText>
                  ) : (
                    <TranslatableText>Send Message</TranslatableText>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Emergency Numbers Section */}
      <section className={`py-16 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              <TranslatableText>Emergency Numbers</TranslatableText>
            </h2>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              <TranslatableText>Important emergency contacts for immediate assistance</TranslatableText>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🚔", title: "Police", number: "100" },
              { icon: "🚑", title: "Ambulance", number: "108" },
              { icon: "🔥", title: "Fire", number: "101" },
              { icon: "📞", title: "National Emergency", number: "112" }
            ].map((emergency, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`p-6 rounded-xl text-center ${darkMode ? "bg-gray-700" : "bg-gray-50"} hover:shadow-lg transition-shadow`}
              >
                <div className="text-4xl mb-3">{emergency.icon}</div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  <TranslatableText>{emergency.title}</TranslatableText>
                </h3>
                <p className="text-2xl font-bold text-red-600">{emergency.number}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
