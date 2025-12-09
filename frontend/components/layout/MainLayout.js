"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plus, Sun, Moon, Send, Mic, User, LogOut, MessageSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

// --- CUSTOM HOOKS ---
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useSpeech } from '@/hooks/useSpeech';

// --- COMPONENTS (New Paths) ---
import { BotMessage, UserMessage } from '@/components/chat/ChatMessages';
import SuggestionChips from '@/components/chat/SuggestionChips';
import AuthModal from '@/components/ui/AuthModal';
import OnboardingModal from '@/components/ui/OnboardingModal';

export default function MainLayout() {
  // --- UI STATE ---
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // --- LOGIC INTEGRATION ---
  const { 
    user, showOnboarding, setShowOnboarding, 
    showAuthModal, setShowAuthModal, handleLogout 
  } = useAuth();

  const { 
    messages, input, setInput, isLoading, 
    sessions, currentSessionId, 
    handleSend, startNewChat, loadSession 
  } = useChat(user);

  const { startListening } = useSpeech();

  // --- EFFECTS ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom() }, [messages, isLoading]);

  // --- HANDLERS ---
  const handleVoiceInput = () => {
    startListening((text) => setInput(text));
  };

  const handleSidebarSelect = (sessionId) => {
    loadSession(sessionId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // --- RENDER ---
  return (
    <div className={`niti-layout ${isDark ? 'dark' : ''}`}>
      <div className="niti-bg-pattern"></div>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <OnboardingModal isOpen={showOnboarding} userId={user?.id} onComplete={() => setShowOnboarding(false)} />

      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"/>}

      {/* SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.2 }}
            className={`niti-sidebar absolute md:relative shadow-2xl md:shadow-none`}
          >
            <div className="p-4 flex items-center justify-between border-b border-[var(--sidebar-border)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 via-white to-green-500 p-[1px]">
                   <div className={`w-full h-full rounded flex items-center justify-center font-bold ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>N</div>
                </div>
                <span className="font-bold text-lg">Niti.ai</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-800 rounded">
                {typeof window !== 'undefined' && window.innerWidth < 768 ? <X size={20}/> : <PanelLeftClose size={20} className="text-gray-500"/>}
              </button>
            </div>

            <div className="px-3 mb-4 mt-4">
              <button onClick={startNewChat} className="w-full flex items-center gap-2 p-3 rounded-lg border border-[var(--sidebar-border)] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <Plus size={18} /> New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <p className="text-xs font-semibold opacity-50 px-2 mb-2">HISTORY</p>
              {sessions.length === 0 ? (
                <p className="text-xs text-center opacity-40 mt-4">No history yet</p>
              ) : (
                sessions.map((session) => (
                  <button 
                    key={session.id} 
                    onClick={() => handleSidebarSelect(session.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm truncate transition flex items-center gap-2 ${
                      currentSessionId === session.id 
                        ? (isDark ? "bg-[#2a2a2a] text-white" : "bg-blue-50 text-blue-700") 
                        : (isDark ? "hover:bg-[#2a2a2a] text-gray-400" : "hover:bg-gray-100 text-gray-700")
                    }`}
                  >
                    <MessageSquare size={14} className="shrink-0 opacity-70" />
                    <span className="truncate">{session.title || "New Chat"}</span>
                  </button>
                ))
              )}
            </div>

            <div className="mt-auto p-4 border-t border-[var(--sidebar-border)]">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">{user.email?.[0].toUpperCase()}</div>
                    <div className="text-xs truncate dark:text-gray-300">
                      <p className="font-medium truncate">User</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="p-2 hover:text-red-500"><LogOut size={18} /></button>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 text-sm dark:text-white w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><User size={18} /> Sign In</button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="niti-main w-full">
        <header className="niti-header">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded hover:bg-white/10">
                {typeof window !== 'undefined' && window.innerWidth < 768 ? <Menu size={24} /> : <PanelLeftOpen size={24} />}
              </button>
            )}
            <div><h1 className="font-bold text-lg leading-tight">Niti.ai</h1><p className="text-[10px] opacity-80">GOVT SCHEME ASSISTANT</p></div>
          </div>
          <button onClick={() => setIsDark(!isDark)} className="p-2 bg-white/10 rounded-full hover:bg-white/20">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
        </header>

        <div className="niti-chat-area">
          {messages.map((msg, index) => (
            <div key={msg.id} className="w-full">
              {msg.role === "user" ? (
                <UserMessage content={msg.content} />
              ) : (
                <BotMessage 
                  content={msg.content} 
                  isDark={isDark} 
                  isNew={index === messages.length - 1 && index > 0 && !isLoading} 
                />
              )}
            </div>
          ))}
          {isLoading && <BotMessage content="" isTyping={true} isDark={isDark} />}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        <div className="niti-input-area flex flex-col gap-2">
          {!isLoading && (
            <div className="w-full px-4 md:max-w-3xl md:mx-auto">
               <SuggestionChips 
                 onSelect={(text) => handleSend(text)} 
                 isNewChat={messages.length === 1} 
               />
            </div>
          )}
          <div className="niti-input-box">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              onFocus={scrollToBottom}
              placeholder="Ask about schemes..."
              className="flex-1 bg-transparent border-none outline-none text-sm md:text-base dark:text-white dark:placeholder:text-gray-500 text-slate-900"
            />
            <button onClick={handleVoiceInput} className="p-2 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition shadow-lg shrink-0"><Mic size={20} /></button>
            {input.trim() && (
              <button onClick={() => handleSend()} className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition shrink-0"><Send size={18} /></button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}