"use client";
import React from "react";
import { motion } from "framer-motion";

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

// --- BOT MESSAGE BUBBLE ---
export function BotMessage({ content, isTyping, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex gap-3 max-w-3xl w-full"
    >
      {/* Saffron Strip (Vertical Bar) */}
      <div className="w-1 rounded-full shrink-0 bg-[#FF9933]" />
      
      <div className="py-1 w-full">
        {isTyping ? (
          <TypingIndicator isDark={isDark} />
        ) : (
          <div className={`leading-relaxed whitespace-pre-wrap text-[15px] ${isDark ? "text-gray-100" : "text-slate-800"}`}>
             {/* Text Rendering logic */}
             {content.split('\n').map((line, i) => (
               <p key={i} className="mb-1">{line}</p>
             ))}
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
        <p className="leading-relaxed">{content}</p>
      </div>
    </motion.div>
  );
}