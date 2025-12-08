"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Volume2, StopCircle } from 'lucide-react';

// --- TYPING INDICATOR ---
export function TypingIndicator({ isDark }) {
  return (
    <div className="flex items-center gap-2 p-2">
      <span className={`text-sm font-medium opacity-70 ${isDark ? "text-gray-300" : "text-slate-600"}`}>
        Niti is thinking
      </span>
      <span className={`inline-block w-2.5 h-2.5 rounded-full animate-pulse ${isDark ? "bg-white" : "bg-black"}`} />
    </div>
  );
}

// --- TYPEWRITER COMPONENT ---
function TypewriterText({ content, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let index = 0;
    // Speed control: 5ms for faster typing
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + content.charAt(index));
      index++;
      if (index === content.length) {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 5); 

    return () => clearInterval(intervalId);
  }, [content]);

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]} 
      className="prose leading-relaxed break-words"
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold" />
        )
      }}
    >
      {displayedText}
    </ReactMarkdown>
  );
}

// --- BOT MESSAGE (With Speaker) ---
export function BotMessage({ content, isTyping, isDark, isNew }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Function to strip Markdown symbols (*, #, links) for clean reading
  const cleanTextForSpeech = (text) => {
    return text
      .replace(/\*\*/g, '')       // Remove Bold
      .replace(/#/g, '')          // Remove Headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text, remove URL
      .replace(/https?:\/\/\S+/g, 'link'); // Replace raw URLs with word "link"
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = cleanTextForSpeech(content);
      const utterance = new SpeechSynthesisUtterance(textToRead);
      
      // Try to find an Indian English/Hindi voice
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('IN')) || voices[0];
      if (indianVoice) utterance.voice = indianVoice;

      utterance.rate = 1; // Speed
      utterance.pitch = 1; 

      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Stop speaking if component unmounts (user leaves chat)
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex gap-3 max-w-3xl w-full group" // 'group' for hover effects
    >
      {/* Saffron Strip */}
      <div className="w-1 rounded-full shrink-0 bg-[#FF9933]" />
      
      <div className="py-1 w-full">
        {isTyping ? (
          <TypingIndicator isDark={isDark} />
        ) : (
          <div className="relative">
            <div className={`text-[15px] ${isDark ? "text-gray-100" : "text-slate-800"}`}>
               {isNew ? (
                  <TypewriterText content={content} />
               ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    className="prose leading-relaxed break-words"
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold" />
                      )
                    }}
                  >
                    {content}
                  </ReactMarkdown>
               )}
            </div>

            {/* SPEAKER BUTTON (Only shows when not typing) */}
            {!isNew && (
              <button 
                onClick={handleSpeak}
                className={`mt-2 p-1.5 rounded-full transition-all flex items-center gap-2 text-xs font-medium border ${
                  isSpeaking 
                    ? 'bg-orange-100 text-orange-600 border-orange-200' 
                    : 'opacity-0 group-hover:opacity-100 bg-transparent text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <StopCircle size={14} className="animate-pulse" /> Stop Reading
                  </>
                ) : (
                  <>
                    <Volume2 size={14} /> Listen
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- USER MESSAGE ---
export function UserMessage({ content }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex justify-end w-full"
    >
      <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-br-none max-w-[85%] shadow-md shadow-blue-500/10 text-[15px]">
        <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </motion.div>
  );
}