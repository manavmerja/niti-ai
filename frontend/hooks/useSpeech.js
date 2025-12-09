import { useState, useCallback } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback((onResult) => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-IN'; // Indian Accent
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript); // Result wapas bhejo
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech Error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      alert("Voice input not supported in this browser.");
    }
  }, []);

  return { isListening, startListening };
}