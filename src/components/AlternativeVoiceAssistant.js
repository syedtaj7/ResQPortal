import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TranslatableText from './TranslatableText';
import emergencyServices from '../services/emergencyServices';

const AlternativeVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [helpCount, setHelpCount] = useState(0);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [alertingAuthorities, setAlertingAuthorities] = useState(false);
  const [lastError, setLastError] = useState(null);
  
  const recognitionRef = useRef(null);
  const helpCountRef = useRef(0);
  const timeoutRef = useRef(null);

  // Help keywords in multiple languages (simplified)
  const helpKeywords = ['help', 'ayuda', 'aide', 'hilfe', 'aiuto', 'ajuda', 'मदद', 'مساعدة', '帮助', '助けて', '도움', 'помощь'];

  // Check support on mount
  React.useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
  }, []);

  // Check for help keywords
  const checkForHelpKeywords = (text) => {
    const foundKeywords = helpKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      helpCountRef.current += 1;
      setHelpCount(helpCountRef.current);
      
      console.log(`Help detected (${helpCountRef.current}/3):`, foundKeywords);
      
      // Reset counter after 10 seconds if not completed
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        helpCountRef.current = 0;
        setHelpCount(0);
      }, 10000);

      // Trigger emergency mode after 3 detections
      if (helpCountRef.current >= 3) {
        triggerEmergencyMode();
      }
    }
  };

  // Single-shot voice recognition
  const startSingleRecognition = () => {
    if (!isSupported) {
      alert('Speech recognition not supported in your browser.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎤 Listening...');
        setLastError(null);
      };

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        console.log('🎤 Heard:', result);
        setTranscript(result);
        checkForHelpKeywords(result);
        
        // Continue listening if still in listening mode and not in emergency
        if (isListening && !emergencyMode) {
          setTimeout(() => startSingleRecognition(), 500);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setLastError(event.error);
        
        if (event.error === 'network') {
          console.warn('Network error - stopping voice recognition');
          setIsListening(false);
          alert('🌐 Speech service unavailable. Use the manual emergency button instead.');
        } else if (event.error === 'not-allowed') {
          alert('🎤 Microphone access denied. Please enable microphone permissions.');
          setIsListening(false);
        } else {
          // For other errors, try to continue
          if (isListening && !emergencyMode) {
            setTimeout(() => startSingleRecognition(), 1000);
          }
        }
      };

      recognition.onend = () => {
        console.log('🎤 Recognition ended');
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setLastError('start-failed');
    }
  };

  // Toggle listening
  const toggleListening = async () => {
    if (emergencyMode) return;

    if (isListening) {
      setIsListening(false);
      helpCountRef.current = 0;
      setHelpCount(0);
      console.log('🎤 Stopped listening');
    } else {
      try {
        // Test microphone access first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        setIsListening(true);
        startSingleRecognition();
        console.log('🎤 Started listening - say "help" 3 times for emergency');
      } catch (error) {
        console.error('Microphone access error:', error);
        alert('🎤 Cannot access microphone. Please check permissions.');
      }
    }
  };

  // Trigger emergency mode
  const triggerEmergencyMode = async () => {
    setEmergencyMode(true);
    setIsListening(false);
    setAlertingAuthorities(true);
    
    // Play emergency sound
    playEmergencySound();
    
    try {
      const emergencyData = {
        type: 'voice_emergency',
        timestamp: new Date().toISOString(),
        transcript: transcript,
        helpCount: helpCount,
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

  // Manual emergency trigger
  const manualEmergencyTrigger = () => {
    helpCountRef.current = 3;
    setHelpCount(3);
    triggerEmergencyMode();
  };

  // Reset emergency mode
  const resetEmergencyMode = () => {
    setEmergencyMode(false);
    setAlertingAuthorities(false);
    helpCountRef.current = 0;
    setHelpCount(0);
    setTranscript('');
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          onClick={manualEmergencyTrigger}
          className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Manual Emergency Trigger (Voice not supported)"
        >
          <span className="text-white text-2xl">🆘</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
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

      {/* Voice Assistant Buttons */}
      <div className="flex flex-col gap-3">
        {/* Manual Emergency Button (always visible) */}
        <motion.button
          onClick={manualEmergencyTrigger}
          disabled={emergencyMode}
          className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          whileHover={!emergencyMode ? { scale: 1.1 } : {}}
          whileTap={!emergencyMode ? { scale: 0.95 } : {}}
          title="Manual Emergency Trigger"
        >
          <span className="text-white text-lg">🆘</span>
        </motion.button>

        {/* Voice Assistant Button */}
        <motion.button
          onClick={toggleListening}
          disabled={emergencyMode}
          className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
            emergencyMode
              ? 'bg-red-600 cursor-not-allowed'
              : isListening
              ? 'bg-gradient-to-r from-green-500 to-blue-500'
              : lastError === 'network'
              ? 'bg-gradient-to-r from-gray-500 to-gray-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          }`}
          whileHover={!emergencyMode ? { scale: 1.1 } : {}}
          whileTap={!emergencyMode ? { scale: 0.95 } : {}}
          animate={isListening ? { 
            boxShadow: [
              '0 0 0 0 rgba(34, 197, 94, 0.7)',
              '0 0 0 20px rgba(34, 197, 94, 0)',
            ]
          } : {}}
          transition={isListening ? { duration: 1.5, repeat: Infinity } : {}}
        >
          <motion.div
            animate={isListening ? { scale: [1, 1.2, 1] } : {}}
            transition={isListening ? { duration: 1, repeat: Infinity } : {}}
            className="text-white text-2xl"
          >
            {emergencyMode ? '🚨' : isListening ? '🎤' : lastError === 'network' ? '❌' : '🎙️'}
          </motion.div>
          
          {/* Help count indicator */}
          {helpCount > 0 && !emergencyMode && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
            >
              {helpCount}
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Status tooltip */}
      <AnimatePresence>
        {(isListening || emergencyMode || lastError) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm max-w-xs"
          >
            {emergencyMode ? (
              <TranslatableText>Emergency Mode Active</TranslatableText>
            ) : lastError === 'network' ? (
              <div>
                <div className="text-red-300 font-semibold">Network Error</div>
                <div className="text-xs text-gray-300">Use manual emergency button (🆘)</div>
              </div>
            ) : isListening ? (
              <div>
                <div><TranslatableText>Listening for "help" ({helpCount}/3)</TranslatableText></div>
                <div className="text-xs text-gray-300">Single-shot recognition mode</div>
              </div>
            ) : (
              <div>
                <div><TranslatableText>Click to activate voice emergency</TranslatableText></div>
                <div className="text-xs text-gray-300">Or use manual button (🆘)</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlternativeVoiceAssistant;
