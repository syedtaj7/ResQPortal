import React, { useState, useRef } from 'react';

const VoiceTestComponent = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Check support on component mount
  React.useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
    
    if (supported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false; // Single recognition for testing
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setError(null);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        console.log('Transcript:', finalTranscript || interimTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
    }
  }, []);

  const startListening = async () => {
    if (!isSupported) {
      alert('Speech recognition not supported');
      return;
    }

    try {
      // Test microphone access first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      // Start recognition
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Microphone error:', err);
      setError('microphone-access');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg max-w-sm">
      <h3 className="font-bold mb-2">🎤 Voice Test</h3>
      
      <div className="space-y-2 text-sm">
        <div>Supported: {isSupported ? '✅' : '❌'}</div>
        <div>Status: {isListening ? '🎤 Listening' : '⏸️ Stopped'}</div>
        {error && <div className="text-red-300">Error: {error}</div>}
        {transcript && (
          <div className="bg-gray-800 p-2 rounded text-xs">
            <strong>Heard:</strong> "{transcript}"
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={startListening}
          disabled={isListening || !isSupported}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm"
        >
          Start
        </button>
        <button
          onClick={stopListening}
          disabled={!isListening}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-sm"
        >
          Stop
        </button>
        <button
          onClick={() => {
            setTranscript('');
            setError(null);
          }}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          Clear
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Try saying: "hello", "help", "test"
      </div>
    </div>
  );
};

export default VoiceTestComponent;
