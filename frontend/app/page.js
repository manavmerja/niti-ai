"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plus, Sun, Moon, Send, Mic, User, MessageSquare, ChevronLeft, Mail, ShieldCheck } from 'lucide-react';

// --- HELPER COMPONENTS ---

// 1. Black Ball Typing Indicator
function TypingIndicator({ isDark }) {
  return (
    <div className="flex items-center gap-2 p-2">
      <span className="text-sm opacity-70">Niti is thinking</span>
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full animate-pulse ${
          isDark ? "bg-white" : "bg-black"
        }`}
      />
    </div>
  );
}

// 2. Bot Message Bubble
function BotMessage({ content, isTyping, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex gap-3 max-w-2xl w-full"
    >
      {/* Saffron Strip */}
      <div className="w-1 rounded-full shrink-0 bg-[#FF9933]" />
      
      <div className="py-1">
        {isTyping ? (
          <TypingIndicator isDark={isDark} />
        ) : (
          <div className="leading-relaxed whitespace-pre-wrap">
             {/* Simple formatting for lines */}
             {content.split('\n').map((line, i) => (
               <p key={i} className="mb-1">{line}</p>
             ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// 3. User Message Bubble
function UserMessage({ content }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex justify-end w-full"
    >
      <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-br-none max-w-[85%] shadow-md shadow-blue-500/10">
        <p className="leading-relaxed">{content}</p>
      </div>
    </motion.div>
  );
}

// 4. Auth Modal (Login Popup)
function AuthModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-[#1a1a1a] shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">Niti.ai</span>
                <span className="text-xl">🇮🇳</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-sm text-slate-500 mb-6">Sign in to save your chat history.</p>

            <button className="w-full py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-medium mb-3 flex items-center justify-center gap-2 hover:opacity-90 transition">
              <Mail size={18} />
              Continue with Email
            </button>
            
            <button className="w-full py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300">
              Google
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function NitiPage() {
  // States
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Namaste! 🙏 I am Niti.ai. Ask me anything about Indian Government schemes." }
  ]);
  
  const messagesEndRef = useRef(null);

  // Toggle Theme (Adds .dark class to body)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle Send Message (Connects to Python Backend)
  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    
    // 1. Add User Msg
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: userText }]);
    setIsLoading(true);

    try {
      // 2. Call Python API
      const res = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
      });

      const data = await res.json();

      // 3. Add Bot Response
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: "assistant", 
        content: data.response || "Sorry, I couldn't understand that." 
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: "assistant", 
        content: "⚠️ Network Error: Is the Python backend running?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Background Styles
  const bgClass = isDark 
    ? "bg-[#212121] text-slate-100 dot-grid-dark" 
    : "bg-[#F8FAFC] text-slate-900 dot-grid-light";

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${bgClass}`}>
      
      {/* AUTH MODAL */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      {/* --- SIDEBAR --- */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            className={`w-[280px] flex-none flex flex-col z-20 absolute md:relative h-full border-r ${
              isDark ? "bg-[#1a1a1a] border-[#333]" : "bg-white border-slate-200"
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 via-white to-green-500 p-[1px]">
                 <div className={`w-full h-full rounded flex items-center justify-center font-bold ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>N</div>
              </div>
              <span className="font-bold text-lg">Niti.ai</span>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto p-1">
                <X size={20} />
              </button>
            </div>

            {/* New Chat */}
            <div className="px-3 mb-4">
              <button 
                onClick={() => setMessages([{ id: 1, role: "assistant", content: "Namaste! New conversation started." }])}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  isDark ? "border-[#333] hover:bg-[#2a2a2a]" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Plus size={16} />
                <span>New Chat</span>
              </button>
            </div>

            {/* History */}
            <div className="flex-1 overflow-y-auto px-3 space-y-4">
              <p className="text-xs font-semibold opacity-50 px-2">RECENT</p>
              {["PM Kisan Yojana", "Scholarships 2024", "Mudra Loan"].map((item, i) => (
                <button key={i} className={`w-full text-left px-2 py-2 rounded-md text-sm truncate transition ${
                  isDark ? "hover:bg-[#2a2a2a] text-slate-300" : "hover:bg-slate-100 text-slate-700"
                }`}>
                  {item}
                </button>
              ))}
            </div>

            {/* Footer / Login */}
            <div className={`p-4 border-t ${isDark ? "border-[#333]" : "border-slate-200"}`}>
               <button 
                 onClick={() => setShowAuth(true)}
                 className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${
                   isDark ? "hover:bg-[#2a2a2a]" : "hover:bg-slate-100"
                 }`}
               >
                 <User size={18} />
                 <span>Sign In</span>
               </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col relative h-full">
        
        {/* Header */}
        <header className={`h-16 flex items-center justify-between px-4 sticky top-0 z-10 backdrop-blur-md ${
           isDark ? "bg-[#212121]/80" : "bg-[#1e3a8a] text-white shadow-md"
        }`}>
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded hover:bg-white/10">
                <Menu size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Niti.ai Assistant</span>
              <span className="text-[10px] opacity-80">GOVT OF INDIA</span>
            </div>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "user" ? (
                <UserMessage content={msg.content} />
              ) : (
                <BotMessage content={msg.content} isDark={isDark} />
              )}
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <BotMessage content="" isTyping={true} isDark={isDark} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Floating) */}
        <div className="absolute bottom-6 w-full px-4 flex justify-center z-20">
          <div className={`w-full max-w-2xl p-2 rounded-full flex items-center gap-2 border shadow-xl transition-all ${
            isDark 
              ? "bg-[#2a2a2a] border-[#444]" 
              : "bg-white border-slate-200"
          }`}>
            
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about any scheme..."
              className={`flex-1 bg-transparent border-none outline-none px-4 py-2 ${
                isDark ? "text-white placeholder:text-gray-500" : "text-slate-900 placeholder:text-slate-400"
              }`}
            />

            {/* Orange Mic Button (Pulse) */}
            <button className="p-3 rounded-full bg-[#FF9933] text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 animate-pulse">
              <Mic size={20} />
            </button>

            {/* Send Button */}
            {input.trim() && (
              <button onClick={handleSend} className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">
                <Send size={18} />
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}