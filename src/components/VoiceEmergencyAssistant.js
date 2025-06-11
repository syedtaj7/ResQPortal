import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TranslatableText from './TranslatableText';
import emergencyServices from '../services/emergencyServices';
import EmergencyContactsSetup from './EmergencyContactsSetup';

const VoiceEmergencyAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [helpCount, setHelpCount] = useState(0);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [alertingAuthorities, setAlertingAuthorities] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [microphoneStatus, setMicrophoneStatus] = useState('unknown');
  
  const recognitionRef = useRef(null);
  const helpCountRef = useRef(0);
  const timeoutRef = useRef(null);

  // Help keywords in multiple languages
  const helpKeywords = {
    english: ['help', 'emergency', 'urgent', 'rescue', 'danger', 'crisis'],
    spanish: ['ayuda', 'auxilio', 'emergencia', 'urgente', 'rescate', 'peligro'],
    french: ['aide', 'secours', 'urgence', 'danger', 'crise'],
    german: ['hilfe', 'notfall', 'dringend', 'rettung', 'gefahr'],
    italian: ['aiuto', 'emergenza', 'urgente', 'soccorso', 'pericolo'],
    portuguese: ['ajuda', 'emergência', 'urgente', 'socorro', 'perigo'],
    hindi: ['मदद', 'सहायता', 'आपातकाल', 'बचाव', 'खतरा'],
    arabic: ['مساعدة', 'طوارئ', 'عاجل', 'إنقاذ', 'خطر'],
    chinese: ['帮助', '紧急', '救援', '危险', '求救'],
    japanese: ['助けて', '緊急', '救助', '危険', 'ヘルプ'],
    korean: ['도움', '응급', '구조', '위험', '헬프'],
    russian: ['помощь', 'срочно', 'спасение', 'опасность', 'кризис'],
    dutch: ['hulp', 'noodgeval', 'dringend', 'redding', 'gevaar'],
    swedish: ['hjälp', 'nödsituation', 'brådskande', 'räddning', 'fara'],
    norwegian: ['hjelp', 'nødsituasjon', 'haster', 'redning', 'fare']
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = false; // Changed to false to avoid network issues
      recognition.interimResults = false; // Simplified to avoid network overhead
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎤 Voice recognition started');
        setMicrophoneStatus('listening');
        setLastError(null);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          const textToCheck = finalTranscript.toLowerCase().trim();
          console.log('🎤 Heard:', textToCheck);
          setTranscript(textToCheck);
          checkForHelpKeywords(textToCheck);

          // Restart listening after processing
          setTimeout(() => {
            if (isListening && !emergencyMode) {
              try {
                recognition.start();
              } catch (error) {
                console.warn('Could not restart recognition:', error);
              }
            }
          }, 500);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setLastError(event.error);
        setMicrophoneStatus('error');

        switch (event.error) {
          case 'not-allowed':
            alert('🎤 Microphone access denied. Please enable microphone permissions for emergency voice assistance.');
            setIsListening(false);
            setIsActive(false);
            break;
          case 'network':
            console.warn('Network error - speech service unavailable. Switching to manual mode...');
            setMicrophoneStatus('network-error');
            setIsListening(false);
            setIsActive(false);
            // Show user-friendly message
            alert('🌐 Network Error: Speech recognition service is currently unavailable.\n\n' +
                  '✅ Don\'t worry! You can still use the manual emergency button (🆘) that will appear.\n\n' +
                  '💡 Try refreshing the page or check your internet connection.');
            break;
          case 'no-speech':
            console.log('No speech detected, continuing to listen...');
            setMicrophoneStatus('no-speech');
            break;
          case 'audio-capture':
            alert('🎤 No microphone found. Please check your microphone connection.');
            setIsListening(false);
            setIsActive(false);
            break;
          case 'service-not-allowed':
            alert('🎤 Speech recognition service not allowed. Please check your browser settings.');
            setIsListening(false);
            setIsActive(false);
            break;
          case 'aborted':
            console.log('Speech recognition aborted');
            setMicrophoneStatus('aborted');
            break;
          default:
            console.warn(`Speech recognition error: ${event.error}`);
            setMicrophoneStatus('unknown-error');
        }
      };

      recognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        // Don't auto-restart here since we're using single-shot recognition
        // Restart is handled in onresult after processing
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.warn('Error stopping recognition:', error);
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening, emergencyMode]);

  // Check for help keywords in multiple languages
  const checkForHelpKeywords = useCallback((text) => {
    const foundKeywords = [];
    
    Object.entries(helpKeywords).forEach(([language, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          foundKeywords.push({ language, keyword });
        }
      });
    });

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
  }, []);

  // Trigger emergency mode
  const triggerEmergencyMode = useCallback(() => {
    setEmergencyMode(true);
    setIsListening(false);
    setAlertingAuthorities(true);
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Play emergency sound
    playEmergencySound();
    
    // Alert authorities (simulate)
    alertEmergencyServices();
    
    // Get user location
    getCurrentLocation();
    
    console.log('🚨 EMERGENCY MODE ACTIVATED 🚨');
  }, []);

  // Play emergency sound
  const playEmergencySound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.5);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 1.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.5);
  };

  // Alert emergency services using the real service
  const alertEmergencyServices = async () => {
    try {
      console.log('🚨 Alerting Emergency Services...');

      const emergencyData = {
        type: 'voice_emergency',
        timestamp: new Date().toISOString(),
        transcript: transcript,
        helpCount: helpCount,
        userAgent: navigator.userAgent
      };

      // Use the real emergency services
      const results = await emergencyServices.triggerEmergencyAlert(emergencyData);

      console.log('Emergency services response:', results);
      setAlertingAuthorities(false);

      // Show detailed success message
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

      // Show error but still indicate that basic emergency protocols were triggered
      alert('⚠️ Emergency alert sent with limited functionality.\n\n' +
            'Please manually contact emergency services:\n' +
            'Police: 100 | Fire: 101 | Ambulance: 108 | Emergency: 112');
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Emergency location:', { latitude, longitude });
          
          // In a real implementation, send this to emergency services
          const locationData = {
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          
          console.log('Location data for emergency services:', locationData);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  // Start/stop listening
  const toggleListening = async () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (emergencyMode) {
      return; // Don't allow toggling in emergency mode
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
        setIsListening(false);
        setIsActive(false);
        helpCountRef.current = 0;
        setHelpCount(0);
        console.log('🎤 Voice recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    } else {
      try {
        // Check if microphone permission is granted
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'microphone' });
          if (permission.state === 'denied') {
            alert('🎤 Microphone access is denied. Please enable microphone permissions in your browser settings and refresh the page.');
            return;
          }
        }

        // Test microphone access
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        } catch (micError) {
          console.error('Microphone access error:', micError);
          alert('🎤 Cannot access microphone. Please check your microphone permissions and try again.');
          return;
        }

        // Start speech recognition
        recognitionRef.current?.start();
        setIsListening(true);
        setIsActive(true);
        console.log('🎤 Voice recognition started - say "help" 3 times for emergency');

        // Show instructions
        setTimeout(() => {
          if (isListening) {
            console.log('💡 Tip: Speak clearly and say "help" three times to trigger emergency mode');
          }
        }, 2000);

      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('🎤 Failed to start voice recognition. Please check your microphone and try again.');
      }
    }
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
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm max-w-xs">
          <TranslatableText>Voice assistant not supported in this browser</TranslatableText>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
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

      {/* Debug Panel */}
      <AnimatePresence>
        {debugMode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mb-4 bg-black/90 border border-gray-600 rounded-xl p-4 text-white text-xs max-w-xs"
          >
            <h4 className="font-bold mb-2">🔧 Debug Info</h4>
            <div className="space-y-1">
              <div>Status: <span className="text-blue-300">{microphoneStatus}</span></div>
              <div>Supported: <span className="text-green-300">{isSupported ? 'Yes' : 'No'}</span></div>
              <div>Listening: <span className="text-yellow-300">{isListening ? 'Yes' : 'No'}</span></div>
              <div>Help Count: <span className="text-red-300">{helpCount}/3</span></div>
              {lastError && <div>Last Error: <span className="text-red-400">{lastError}</span></div>}
              {transcript && <div>Last: <span className="text-gray-300">"{transcript.slice(-20)}..."</span></div>}
            </div>
            <button
              onClick={() => setDebugMode(false)}
              className="mt-2 text-gray-400 hover:text-white text-xs"
            >
              Hide Debug
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Assistant Buttons Container */}
      <div className="flex flex-col gap-3">
        {/* Debug Toggle Button */}
        <motion.button
          onClick={() => setDebugMode(!debugMode)}
          className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Toggle Debug Mode"
        >
          <span className="text-white text-xs">🔧</span>
        </motion.button>

        {/* Setup Button */}
        <motion.button
          onClick={() => setShowSetup(true)}
          className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Setup Emergency Contacts"
        >
          <span className="text-white text-lg">⚙️</span>
        </motion.button>

        {/* Manual Emergency Button (fallback) */}
        {(lastError === 'network' || microphoneStatus === 'error') && (
          <motion.button
            onClick={() => {
              helpCountRef.current = 3;
              setHelpCount(3);
              triggerEmergencyMode();
            }}
            className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Manual Emergency Trigger (Voice Recognition Failed)"
          >
            <span className="text-white text-lg">🆘</span>
          </motion.button>
        )}

        {/* Voice Assistant Button */}
        <motion.button
          onClick={toggleListening}
          disabled={emergencyMode}
          className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
            emergencyMode
              ? 'bg-red-600 cursor-not-allowed'
              : isListening
              ? 'bg-gradient-to-r from-red-500 to-orange-500'
              : lastError === 'network'
              ? 'bg-gradient-to-r from-gray-500 to-gray-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          }`}
          whileHover={!emergencyMode ? { scale: 1.1 } : {}}
          whileTap={!emergencyMode ? { scale: 0.95 } : {}}
          animate={isListening ? {
            boxShadow: [
              '0 0 0 0 rgba(59, 130, 246, 0.7)',
              '0 0 0 20px rgba(59, 130, 246, 0)',
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
        {(isActive || emergencyMode || lastError) && (
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
                <div className="text-xs text-gray-300">Speech service unavailable. Use manual emergency button (🆘) if needed.</div>
              </div>
            ) : lastError === 'not-allowed' ? (
              <div>
                <div className="text-red-300 font-semibold">Microphone Blocked</div>
                <div className="text-xs text-gray-300">Please enable microphone permissions and refresh.</div>
              </div>
            ) : isListening ? (
              <div>
                <div><TranslatableText>Listening for "help" ({helpCount}/3)</TranslatableText></div>
                <div className="text-xs text-gray-300">Speak clearly: "help help help"</div>
              </div>
            ) : (
              <div>
                <div><TranslatableText>Click to activate voice emergency</TranslatableText></div>
                <div className="text-xs text-gray-300">Say "help" 3 times to trigger</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Contacts Setup Modal */}
      <EmergencyContactsSetup
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
      />
    </div>
  );
};

export default VoiceEmergencyAssistant;
