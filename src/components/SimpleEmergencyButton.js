import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TranslatableText from './TranslatableText';
import emergencyServices from '../services/emergencyServices';

const SimpleEmergencyButton = () => {
  const [clickCount, setClickCount] = useState(0);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [alertingAuthorities, setAlertingAuthorities] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Handle emergency button clicks
  const handleEmergencyClick = () => {
    if (emergencyMode) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      triggerEmergencyMode();
    } else {
      // Reset count after 5 seconds if not completed
      setTimeout(() => {
        setClickCount(0);
      }, 5000);
    }
  };

  // Trigger emergency mode
  const triggerEmergencyMode = async () => {
    setEmergencyMode(true);
    setAlertingAuthorities(true);
    
    // Play emergency sound
    playEmergencySound();
    
    try {
      const emergencyData = {
        type: 'manual_emergency',
        timestamp: new Date().toISOString(),
        clickCount: 3,
        userAgent: navigator.userAgent
      };

      const results = await emergencyServices.triggerEmergencyAlert(emergencyData);
      
      console.log('Emergency services response:', results);
      setAlertingAuthorities(false);
      
      const locationText = results.location?.address || 'Location unavailable';
      const servicesNotified = results.emergencyServices?.length || 0;
      const contactsNotified = results.notifications?.length || 0;
      
      alert(`🚨 EMERGENCY SERVICES HAVE BEEN NOTIFIED!\n\n` +
            `Location: ${locationText}\n` +
            `Services Notified: ${servicesNotified}\n` +
            `Contacts Notified: ${contactsNotified}\n\n` +
            `Help is on the way. Stay calm and stay safe.`);

    } catch (error) {
      console.error('Error alerting emergency services:', error);
      setAlertingAuthorities(false);
      
      alert('⚠️ Emergency alert sent with limited functionality.\n\n' +
            'Please manually contact emergency services:\n' +
            'Police: 100 | Fire: 101 | Ambulance: 108 | Emergency: 112');
    }
  };

  // Play emergency sound
  const playEmergencySound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.warn('Could not play emergency sound:', error);
    }
  };

  // Reset emergency mode
  const resetEmergencyMode = () => {
    setEmergencyMode(false);
    setAlertingAuthorities(false);
    setClickCount(0);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Instructions Panel */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 bg-blue-900/90 border border-blue-600 rounded-xl p-4 text-white shadow-2xl max-w-xs"
          >
            <h4 className="font-bold mb-2">🆘 Emergency Button</h4>
            <div className="text-sm space-y-1">
              <p>• Click 3 times quickly to trigger emergency</p>
              <p>• Works without voice recognition</p>
              <p>• Alerts emergency services & contacts</p>
              <p>• Use when voice assistant fails</p>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-2 text-blue-300 hover:text-white text-xs"
            >
              Got it!
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Mode Alert */}
      <AnimatePresence>
        {emergencyMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 bg-red-600 border-2 border-red-400 rounded-xl p-4 text-white shadow-2xl max-w-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-2xl"
              >
                🚨
              </motion.div>
              <h3 className="font-bold text-lg">
                <TranslatableText>EMERGENCY MODE ACTIVE</TranslatableText>
              </h3>
            </div>
            
            {alertingAuthorities ? (
              <div className="flex items-center gap-2 text-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span><TranslatableText>Alerting emergency services...</TranslatableText></span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">
                  <TranslatableText>Emergency services have been notified. Help is on the way.</TranslatableText>
                </p>
                <button
                  onClick={resetEmergencyMode}
                  className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <TranslatableText>Reset</TranslatableText>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Button */}
      <div className="flex flex-col gap-3">
        {/* Info Button */}
        <motion.button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Emergency Button Instructions"
        >
          <span className="text-white text-xs">ℹ️</span>
        </motion.button>

        {/* Main Emergency Button */}
        <motion.button
          onClick={handleEmergencyClick}
          disabled={emergencyMode}
          className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
            emergencyMode
              ? 'bg-red-600 cursor-not-allowed'
              : clickCount > 0
              ? 'bg-gradient-to-r from-orange-500 to-red-500'
              : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600'
          }`}
          whileHover={!emergencyMode ? { scale: 1.1 } : {}}
          whileTap={!emergencyMode ? { scale: 0.95 } : {}}
          animate={clickCount > 0 ? { 
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0.7)',
              '0 0 0 20px rgba(239, 68, 68, 0)',
            ]
          } : {}}
          transition={clickCount > 0 ? { duration: 1, repeat: Infinity } : {}}
        >
          <motion.div
            animate={clickCount > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={clickCount > 0 ? { duration: 0.5, repeat: Infinity } : {}}
            className="text-white text-2xl"
          >
            {emergencyMode ? '🚨' : '🆘'}
          </motion.div>
          
          {/* Click count indicator */}
          {clickCount > 0 && !emergencyMode && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
            >
              {clickCount}
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Status tooltip */}
      <AnimatePresence>
        {(clickCount > 0 || emergencyMode) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-20 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
          >
            {emergencyMode ? (
              <TranslatableText>Emergency Mode Active</TranslatableText>
            ) : (
              <TranslatableText>Click {3 - clickCount} more times for emergency</TranslatableText>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleEmergencyButton;
