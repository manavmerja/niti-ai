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

// --- BOT MESSAGE (Corrected Props) ---
export function BotMessage({ content, isTyping, isDark, isNew }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(!isNew);

  // Cleaner Function
  const cleanTextForSpeech = (text) => {
    return text
      .replace(/\*\*/g, '')
      .replace(/#/g, '')
      .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, 'website link');
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = cleanTextForSpeech(content);
      const utterance = new SpeechSynthesisUtterance(textToRead);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google हिन्दी')) || voices.find(v => v.lang.includes('IN')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1; utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => { return () => window.speechSynthesis.cancel(); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex gap-3 max-w-3xl w-full group"
    >
      <div className="w-1 rounded-full shrink-0 bg-[#FF9933]" />
      
      <div className="py-1 w-full">
        {isTyping ? (
          <TypingIndicator isDark={isDark} />
        ) : (
          <div className="relative">
            <div className={`text-[15px] ${isDark ? "text-gray-100" : "text-slate-800"}`}>
               {isNew && !isTypingDone ? (
                  <TypewriterText content={content} onComplete={() => setIsTypingDone(true)} />
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

            {/* SPEAKER BUTTON */}
            {(isTypingDone || !isNew) && (
              <div className="mt-3 flex opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={handleSpeak}
                  className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold border shadow-sm transition-all ${
                    isSpeaking 
                      ? 'bg-red-100 text-red-600 border-red-200' 
                      : isDark 
                        ? 'bg-[#333] text-gray-300 border-[#444] hover:bg-[#444]'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {isSpeaking ? (
                    <><StopCircle size={14} className="animate-pulse" /> Stop</>
                  ) : (
                    <><Volume2 size={14} /> Listen</>
                  )}
                </button>
              </div>
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


