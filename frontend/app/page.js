"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plus, Sun, Moon, Send, Mic, User, ShieldCheck, Mail } from 'lucide-react';

// --- COMPONENTS ---

function BotMessage({ content, isTyping, isDark }) {
  return (
    <div className="flex gap-2 w-full justify-start">
      <div className={`msg-bubble-bot`}>
        {isTyping ? (
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70">Thinking</span>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? "bg-white" : "bg-black"}`} />
          </div>
        ) : (
          <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
             {content}
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div className="flex w-full justify-end">
      <div className="msg-bubble-user text-sm md:text-base">
        {content}
      </div>
    </div>
  );
}

function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <X size={20} className="text-gray-500" />
        </button>
        <h2 className="text-xl font-bold text-center mb-2 dark:text-white">Welcome</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Sign in to Niti.ai</p>
        <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium mb-3">Sign in with Google</button>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function NitiPage() {
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Namaste! 🙏 I am Niti.ai. Ask me anything about Indian Government schemes." }
  ]);
  
  const messagesEndRef = useRef(null);

  // Desktop check: Open sidebar by default on large screens
  useEffect(() => {
    if (window.innerWidth > 768) setIsSidebarOpen(true);
  }, []);

  // Theme Toggle
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Auto Scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  useEffect(() => { scrollToBottom() }, [messages, isLoading]);

  // Voice Logic
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.onresult = (event) => setInput(event.results[0][0].transcript);
      recognition.start();
    } else {
      alert("Voice input not supported in this browser.");
    }
  };

  // Send Logic
  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput("");
    
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch('https://niti-backend.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: data.response || "No response." }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: "⚠️ Network Error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`niti-layout ${isDark ? 'dark' : ''}`}>
      
      <div className="niti-bg-pattern"></div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      {/* --- SIDEBAR --- */}
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Content */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.2 }}
            className={`niti-sidebar absolute md:relative shadow-2xl md:shadow-none`}
          >
            <div className="p-4 flex items-center justify-between border-b border-[var(--sidebar-border)]">
              <span className="font-bold text-xl dark:text-white">Niti.ai</span>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X size={24} className="text-gray-500" /></button>
            </div>
            <div className="p-4">
              <button onClick={() => setMessages([])} className="w-full flex items-center gap-2 p-3 rounded-lg border border-[var(--sidebar-border)] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <Plus size={18} /> New Chat
              </button>
            </div>
            <div className="mt-auto p-4 border-t border-[var(--sidebar-border)]">
              <button onClick={() => { setShowAuth(true); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className="flex items-center gap-2 text-sm dark:text-white w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <User size={18} /> Sign In
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT --- */}
      <main className="niti-main">
        {/* Header */}
        <header className="niti-header">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1 md:hidden">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="font-bold text-lg leading-tight">Niti.ai</h1>
              <p className="text-[10px] opacity-80">GOVT SCHEME ASSISTANT</p>
            </div>
          </div>
          <button onClick={() => setIsDark(!isDark)} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Chat Area */}
        <div className="niti-chat-area">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full">
              {msg.role === "user" ? (
                <UserMessage content={msg.content} />
              ) : (
                <BotMessage content={msg.content} isDark={isDark} />
              )}
            </div>
          ))}
          {isLoading && <BotMessage content="" isTyping={true} isDark={isDark} />}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="niti-input-area">
          <div className="niti-input-box">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              onFocus={scrollToBottom}
              placeholder="Ask about schemes..."
              className="flex-1 bg-transparent border-none outline-none text-sm md:text-base dark:text-white dark:placeholder:text-gray-500 text-slate-900"
            />
            
            <button onClick={startListening} className="p-2 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition shadow-lg shrink-0">
              <Mic size={20} />
            </button>

            {input.trim() && (
              <button onClick={handleSend} className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition shrink-0">
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}