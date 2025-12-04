"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plus, Sun, Moon, Send, Mic, User, ShieldCheck, Mail, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// --- COMPONENTS ---
import { BotMessage, UserMessage } from '@/components/ChatMessages';
import AuthModal from '@/components/AuthModal';
import OnboardingModal from '@/components/OnboardingModal';

export default function NitiPage() {
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default Open for Desktop
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  const initialMsg = { id: 1, role: "assistant", content: "Namaste! 🙏 I am Niti.ai. Ask me anything about Indian Government schemes." };
  const [messages, setMessages] = useState([initialMsg]);
  const messagesEndRef = useRef(null);

  // --- 1. SETUP & AUTH ---
  useEffect(() => {
    // Mobile par sidebar initially band rakho
    if (window.innerWidth < 768) setIsSidebarOpen(false);

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("User Logged In:", session.user.email); // DEBUG
        setUser(session.user);
        fetchHistory(session.user.id);
        
        // Check Profile
        const { data: profile } = await supabase.from('profiles').select('occupation').eq('id', session.user.id).single();
        if (!profile?.occupation) setShowOnboarding(true);
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchHistory(session.user.id);
        setShowAuth(false);
      } else {
        setUser(null);
        setMessages([initialMsg]);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // --- 2. FETCH HISTORY ---
  const fetchHistory = async (userId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("History Fetch Error:", error.message);
    } else if (data && data.length > 0) {
      console.log("History Loaded:", data.length, "messages"); // DEBUG
      setMessages(data.map(msg => ({ id: msg.id, role: msg.role, content: msg.content })));
      setTimeout(scrollToBottom, 500);
    }
  };

  // --- 3. SAVE TO DB (Fixed) ---
  const saveToDb = async (role, content) => {
    if (!user) {
      console.warn("User not logged in, chat won't be saved.");
      return;
    }
    const { error } = await supabase.from('messages').insert([
      { role, content, user_id: user.id }
    ]);
    if (error) console.error("Save Error:", error.message);
    else console.log("Message Saved to DB");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMessages([initialMsg]);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom() }, [messages, isLoading]);
  useEffect(() => { if(isDark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [isDark]);

  const startListening = () => { /* ... Same Voice Logic ... */ };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput("");
    
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: userText }]);
    saveToDb("user", userText); // Save User Msg
    setIsLoading(true);

    try {
      const res = await fetch('https://niti-backend.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
      });
      const data = await res.json();
      const botResponse = data.response || "No response.";
      
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: botResponse }]);
      saveToDb("assistant", botResponse); // Save Bot Msg

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
      <OnboardingModal isOpen={showOnboarding} userId={user?.id} onComplete={() => setShowOnboarding(false)} />

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"/>
      )}

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
              {/* Close Button (Visible on both Mobile & Desktop) */}
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <PanelLeftClose size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="px-3 mb-4 mt-4">
              <button onClick={() => setMessages([initialMsg])} className="w-full flex items-center gap-2 p-3 rounded-lg border border-[var(--sidebar-border)] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <Plus size={18} /> New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-4">
              <p className="text-xs font-semibold opacity-50 px-2">RECENT</p>
              {/* Dummy history for now, Real history loads automatically */}
              <button className="w-full text-left px-2 py-2 rounded-md text-sm truncate hover:bg-gray-100 dark:hover:bg-gray-800">
                Welcome to Niti.ai
              </button>
            </div>

            <div className="mt-auto p-4 border-t border-[var(--sidebar-border)]">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="text-xs truncate dark:text-gray-300">
                      <p className="font-medium truncate">User</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="p-2 hover:text-red-500"><LogOut size={18} /></button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="flex items-center gap-2 text-sm dark:text-white w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <User size={18} /> Sign In
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="niti-main w-full">
        <header className="niti-header">
          <div className="flex items-center gap-3">
            {/* Open Sidebar Button (Visible when sidebar is closed) */}
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded hover:bg-white/10">
                <PanelLeftOpen size={24} />
              </button>
            )}
            {/* Mobile Menu Toggle (Always visible on mobile if closed) */}
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-1 ${isSidebarOpen ? 'hidden' : 'block'}`}>
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

        <div className="niti-chat-area">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full">
              {msg.role === "user" ? <UserMessage content={msg.content} /> : <BotMessage content={msg.content} isDark={isDark} />}
            </div>
          ))}
          {isLoading && <BotMessage content="" isTyping={true} isDark={isDark} />}
          <div ref={messagesEndRef} className="h-1" />
        </div>

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
            <button className="p-2 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition shadow-lg shrink-0"><Mic size={20} /></button>
            {input.trim() && <button onClick={handleSend} className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition shrink-0"><Send size={18} /></button>}
          </div>
        </div>
      </main>
    </div>
  );
}