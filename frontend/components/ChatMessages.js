"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- TYPING INDICATOR (Black Ball Pulse) ---
export function TypingIndicator({ isDark }) {
  return (
    <div className="flex items-center gap-2 p-2">
      <span className={`text-sm font-medium opacity-70 ${isDark ? "text-gray-300" : "text-slate-600"}`}>
        Niti is thinking
      </span>
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full animate-pulse ${
          isDark ? "bg-white" : "bg-black"
        }`}
      />
    </div>
  );
}

// --- TYPEWRITER COMPONENT (Updated for Links) ---
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
    }, 10); 

    return () => clearInterval(intervalId);
  }, [content]);

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]} 
      className="prose text-[15px] leading-relaxed break-words"
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium" />
        )
      }}
    >
      {displayedText}
    </ReactMarkdown>
  );
}

// --- BOT MESSAGE BUBBLE ---
export function BotMessage({ content, isTyping, isDark, isNew }) {
  // Logic: Agar message NAYA hai tabhi type karo, purana hai to direct dikhao
  const shouldAnimate = isNew; 

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex gap-3 max-w-3xl w-full"
    >
      {/* Saffron Strip */}
      <div className="w-1 rounded-full shrink-0 bg-[#FF9933]" />
      
      <div className="py-1 w-full">
        {isTyping ? (
          <TypingIndicator isDark={isDark} />
        ) : (
          <div className={`text-[15px] ${isDark ? "text-gray-100" : "text-slate-800"}`}>
             
             {/* TYPEWRITER EFFECT with NEW TAB LINKS */}
             {shouldAnimate ? (
                <TypewriterText content={content} />
             ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  className="prose leading-relaxed break-words"
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium" />
                    )
                  }}
                >
                  {content}
                </ReactMarkdown>
             )}

          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- USER MESSAGE BUBBLE ---
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