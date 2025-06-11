import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TranslatableText from './TranslatableText';
import emergencyServices from '../services/emergencyServices';
import EmergencyContactsSetup from './EmergencyContactsSetup';

const GoogleVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [alertingAuthorities, setAlertingAuthorities] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showContactsSetup, setShowContactsSetup] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Google Speech-to-Text API configuration
  const GOOGLE_API_KEY = "AIzaSyBkvmZpB_PznWBu2LZjlUY69bEML373MVI";
  const GOOGLE_SPEECH_API_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`;

  // Translation dictionary - maps foreign words to English
  const translationDict = {
    // Spanish
    'ayuda': 'help', 'auxilio': 'help', 'emergencia': 'emergency', 'urgente': 'urgent',
    'rescate': 'rescue', 'peligro': 'danger', 'salvar': 'save',
    // French
    'aide': 'help', 'secours': 'help', 'urgence': 'emergency', 'danger': 'danger',
    'sauver': 'save', 'crise': 'emergency',
    // German
    'hilfe': 'help', 'notfall': 'emergency', 'dringend': 'urgent', 'rettung': 'rescue',
    'gefahr': 'danger', 'retten': 'save',
    // Italian
    'aiuto': 'help', 'emergenza': 'emergency', 'urgente': 'urgent', 'soccorso': 'help',
    'pericolo': 'danger', 'salvare': 'save',
    // Portuguese
    'ajuda': 'help', 'emergência': 'emergency', 'urgente': 'urgent', 'socorro': 'help',
    'perigo': 'danger', 'salvar': 'save',
    // Hindi - Native script
    'मदद': 'help', 'सहायता': 'help', 'आपातकाल': 'emergency', 'बचाव': 'rescue',
    'बचाओ': 'help', 'खतरा': 'danger', 'संकट': 'emergency',
    // Hindi - Transliterated
    'हेल्प': 'help', 'एमर्जेंसी': 'emergency', 'अर्जेंट': 'urgent',
    'रेस्क्यू': 'rescue', 'डेंजर': 'danger',
    // Arabic
    'مساعدة': 'help', 'طوارئ': 'emergency', 'عاجل': 'urgent', 'إنقاذ': 'rescue',
    'خطر': 'danger', 'أنقذوني': 'help',
    // Chinese
    '帮助': 'help', '紧急': 'emergency', '救援': 'rescue', '危险': 'danger',
    '救命': 'help', '求救': 'help',
    // Japanese
    '助けて': 'help', '緊急': 'emergency', '救助': 'rescue', '危険': 'danger',
    '救命': 'help', 'ヘルプ': 'help',
    // Korean
    '도움': 'help', '응급': 'emergency', '구조': 'rescue', '위험': 'danger',
    '살려': 'help', '헬프': 'help',
    // Russian
    'помощь': 'help', 'срочно': 'urgent', 'спасение': 'rescue', 'опасность': 'danger',
    'спасите': 'help', 'кризис': 'emergency',
    // Dutch
    'hulp': 'help', 'noodgeval': 'emergency', 'dringend': 'urgent', 'redding': 'rescue',
    'gevaar': 'danger', 'redden': 'save',
    // Swedish
    'hjälp': 'help', 'nödsituation': 'emergency', 'brådskande': 'urgent',
    'räddning': 'rescue', 'fara': 'danger', 'rädda': 'save',
    // Norwegian
    'hjelp': 'help', 'nødsituasjon': 'emergency', 'haster': 'urgent',
    'redning': 'rescue', 'fare': 'danger', 'redde': 'save'
  };

  // English emergency keywords (what we check for after translation)
  const englishEmergencyKeywords = [
    'help', 'emergency', 'urgent', 'rescue', 'danger', 'save', 'sos',
    'help me', 'save me', 'emergency help', 'urgent help'
  ];

  // Translate text to English
  const translateToEnglish = (text) => {
    console.log('🌍 Original text:', text);

    let translatedText = text.toLowerCase().trim();
    const words = translatedText.split(/\s+/);

    // Translate each word
    const translatedWords = words.map(word => {
      const cleanWord = word.replace(/[^\w\u0900-\u097F\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\u0600-\u06ff]/g, '');
      return translationDict[cleanWord] || cleanWord;
    });

    const finalTranslation = translatedWords.join(' ');
    console.log('🌍 Translated to English:', finalTranslation);

    return finalTranslation;
  };

  // Check for help keywords (now only checks English after translation)
  const checkForHelpKeywords = (text) => {
    console.log('🔍 Checking text for help keywords:', text);

    // First translate to English
    const englishText = translateToEnglish(text);

    const foundKeywords = [];

    // Check each English emergency keyword
    englishEmergencyKeywords.forEach(keyword => {
      if (englishText.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
        console.log(`✅ Found English keyword "${keyword}" in translated text`);
      }
    });

    console.log('🔍 All found English keywords:', foundKeywords);
    console.log('🔍 Total keyword matches:', foundKeywords.length);

    if (foundKeywords.length > 0) {
      console.log('🚨 EMERGENCY KEYWORD DETECTED!', foundKeywords);
      console.log('🚨 Original text:', text);
      console.log('🚨 Translated text:', englishText);
      console.log('🚨🚨🚨 TRIGGERING EMERGENCY MODE IMMEDIATELY! 🚨🚨🚨');

      // Trigger emergency mode immediately on first detection
      triggerEmergencyMode();
    } else {
      console.log('❌ No emergency keywords found');
      console.log('❌ Original text:', text);
      console.log('❌ Translated text:', englishText);
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Try different audio formats for better compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ''; // Use default
      }

      console.log('🎤 Using audio format:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        processAudioWithGoogle();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setLastError(null);
      
      // Stop recording after 3 seconds for processing
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setLastError('microphone-access');
      alert('🎤 Cannot access microphone. Please check permissions.');
    }
  };

  // Process audio with Google Speech-to-Text API
  const processAudioWithGoogle = async () => {
    // Always use Google API with the provided key

    try {
      // Create audio blob with detected mime type
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      console.log('🎤 Processing audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      // Check if we have audio data
      if (audioBlob.size === 0) {
        console.warn('🎤 No audio data recorded');
        if (isListening && !emergencyMode) {
          setTimeout(() => startRecording(), 500);
        }
        return;
      }

      // Try to convert to WAV format for better Google API compatibility
      let finalBlob = audioBlob;
      let encoding = 'WEBM_OPUS';
      let sampleRate = 16000;

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Convert to WAV
        finalBlob = await audioBufferToWav(audioBuffer);
        encoding = 'LINEAR16';
        sampleRate = audioBuffer.sampleRate;

        console.log('🎤 Converted to WAV format');
      } catch (conversionError) {
        console.warn('🎤 WAV conversion failed, using original format:', conversionError);
        // Use original blob with WEBM_OPUS encoding
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];

        const requestBody = {
          config: {
            encoding: encoding,
            sampleRateHertz: sampleRate,
            languageCode: 'en-US',
            alternativeLanguageCodes: ['es-ES', 'fr-FR', 'de-DE', 'hi-IN', 'ar-SA'],
            enableAutomaticPunctuation: false,
            model: 'latest_short'
          },
          audio: {
            content: base64Audio
          }
        };

        try {
          console.log('🎤 Sending request to Google API:', {
            encoding: requestBody.config.encoding,
            sampleRate: requestBody.config.sampleRateHertz,
            audioSize: base64Audio.length
          });

          const response = await fetch(GOOGLE_SPEECH_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('🎤 Google API error response:', errorText);
            throw new Error(`Google API error: ${response.status} - ${errorText}`);
          }

          const result = await response.json();
          console.log('🎤 Google API response:', result);
          
          if (result.results && result.results.length > 0) {
            const transcript = result.results[0].alternatives[0].transcript;
            console.log('🎤 Google Speech API heard:', transcript);
            setTranscript(transcript);

            // Test the keyword detection immediately
            console.log('🧪 Testing keyword detection with transcript:', transcript);
            checkForHelpKeywords(transcript);
          } else {
            console.log('🎤 No speech detected by Google API');
          }
          
          // Continue listening if still in listening mode
          if (isListening && !emergencyMode) {
            setTimeout(() => startRecording(), 500);
          }
          
        } catch (apiError) {
          console.error('Google Speech API error:', apiError);
          setLastError('google-api-error');

          // Continue listening even if there's an error
          if (isListening && !emergencyMode) {
            setTimeout(() => startRecording(), 1000);
          }
        }
      };
      
      reader.readAsDataURL(finalBlob);

    } catch (error) {
      console.error('Error processing audio:', error);
      setLastError('processing-error');

      // Continue listening even if there's an error
      if (isListening && !emergencyMode) {
        setTimeout(() => startRecording(), 1000);
      }
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (audioBuffer) => {
    return new Promise((resolve) => {
      const numberOfChannels = 1; // Mono
      const sampleRate = audioBuffer.sampleRate;
      const format = 1; // PCM
      const bitDepth = 16;

      const channelData = audioBuffer.getChannelData(0);
      const length = channelData.length;
      const arrayBuffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(arrayBuffer);

      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, format, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numberOfChannels * bitDepth / 8, true);
      view.setUint16(32, numberOfChannels * bitDepth / 8, true);
      view.setUint16(34, bitDepth, true);
      writeString(36, 'data');
      view.setUint32(40, length * 2, true);

      // Convert float samples to 16-bit PCM
      let offset = 44;
      for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }

      resolve(new Blob([arrayBuffer], { type: 'audio/wav' }));
    });
  };

  // Note: Using only Google Speech API - no fallback needed

  // Toggle listening
  const toggleListening = async () => {
    if (emergencyMode) return;

    if (isListening) {
      // Stop listening
      setIsListening(false);
      setIsRecording(false);
      
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      console.log('🎤 Stopped listening');
    } else {
      // Start listening
      setIsListening(true);
      setLastError(null);
      startRecording();
      console.log('🎤 Started listening with Google Speech API');
    }
  };

  // Trigger emergency mode
  const triggerEmergencyMode = async () => {
    setEmergencyMode(true);
    setIsListening(false);
    setIsRecording(false);
    setAlertingAuthorities(true);
    
    // Stop any ongoing recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Play emergency sound
    playEmergencySound();
    
    try {
      const emergencyData = {
        type: 'google_voice_emergency',
        timestamp: new Date().toISOString(),
        transcript: transcript,
        detectionMethod: 'instant_translation',
        userAgent: navigator.userAgent,
        apiUsed: 'google-speech-api',
        apiKey: 'configured'
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
    setTranscript('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      {/* Emergency Mode Alert - Fixed position */}
      <AnimatePresence>
        {emergencyMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 right-4 z-50 bg-red-600 border-2 border-red-400 rounded-xl p-4 text-white shadow-2xl max-w-sm"
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

      {/* Main Voice Assistant Container - Bottom Center */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="relative flex flex-col items-center">
          {/* Main Voice Assistant Button */}
          <motion.button
            onClick={toggleListening}
            disabled={emergencyMode}
            className={`relative w-24 h-24 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
              emergencyMode
                ? 'bg-red-600 cursor-not-allowed'
                : isListening
                ? 'bg-gradient-to-r from-green-500 to-blue-500'
                : lastError
                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            } border-4 border-white/20`}
            whileHover={!emergencyMode ? { scale: 1.05 } : {}}
            whileTap={!emergencyMode ? { scale: 0.95 } : {}}
            animate={isListening ? {
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0.7)',
                '0 0 0 30px rgba(34, 197, 94, 0)',
              ]
            } : {}}
            transition={isListening ? { duration: 1.5, repeat: Infinity } : {}}
          >
            <motion.div
              animate={isRecording ? { scale: [1, 1.3, 1] } : isListening ? { scale: [1, 1.1, 1] } : {}}
              transition={isRecording ? { duration: 0.3, repeat: Infinity } : isListening ? { duration: 1, repeat: Infinity } : {}}
              className="text-white text-4xl"
            >
              {emergencyMode ? '🚨' : isRecording ? '🔴' : isListening ? '🎤' : '🎙️'}
            </motion.div>

            {/* Instant detection indicator */}
            {isListening && !emergencyMode && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white"
              >
                🌍
              </motion.div>
            )}

            {/* Pulsing ring when listening */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/30"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>

          {/* Status tooltip */}
          <AnimatePresence>
            {(isListening || emergencyMode || lastError) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 bg-black/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl text-sm max-w-xs text-center shadow-xl order-first"
              >
                {emergencyMode ? (
                  <TranslatableText>Emergency Mode Active</TranslatableText>
                ) : lastError ? (
                  <div>
                    <div className="text-red-300 font-semibold">
                      {lastError === 'google-api-error' ? 'Google API Error' :
                       lastError === 'microphone-access' ? 'Microphone Error' :
                       'Recognition Error'}
                    </div>
                    <div className="text-xs text-gray-300">
                      Retrying with Google Speech API...
                    </div>
                  </div>
                ) : isListening ? (
                  <div>
                    <div className="font-semibold text-green-300"><TranslatableText>🎤 Say "HELP" now!</TranslatableText></div>
                    <div className="text-xs text-gray-300 mt-1">
                      Listening for emergency keywords in any language...
                    </div>
                    <div className="text-xs text-blue-300">
                      Google Speech API • {isRecording ? 'Recording...' : 'Processing...'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div><TranslatableText>Click to activate voice emergency</TranslatableText></div>
                    <div className="text-xs text-gray-300">
                      Say "help" in any language • Instant detection
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Emergency Contacts Button - Bottom Right Corner */}
      <motion.button
        onClick={() => setShowContactsSetup(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center border-2 border-white/20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Emergency Contacts Setup"
      >
        <span className="text-white text-2xl">👥</span>
      </motion.button>

      {/* Emergency Contacts Setup Modal */}
      <EmergencyContactsSetup
        isOpen={showContactsSetup}
        onClose={() => setShowContactsSetup(false)}
      />
    </>
  );
};

export default GoogleVoiceAssistant;
