import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceInput = ({ onTranscript, placeholder = "Say something..." }) => {
  const [isListening, setIsListening] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      setBrowserSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!browserSupported) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN'; // Supporting English with Indian accent
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  if (!browserSupported) return null;

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={toggleListening}
        className={`p-3 rounded-xl transition-all ${
          isListening 
            ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
            : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
        }`}
      >
        {isListening ? (
          <div className="flex items-center gap-2">
            <Mic className="animate-pulse" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Listening...</span>
          </div>
        ) : (
          <Mic size={18} />
        )}
      </motion.button>
      
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute left-full ml-3 whitespace-nowrap bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm"
          >
            <p className="text-[10px] font-bold text-gray-500 italic">Try: "Soil is moist and ready for sowing"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;
