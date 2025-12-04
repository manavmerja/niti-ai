"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plus, Sun, Moon, Send, Mic, User, Mail, LogOut, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// --- IMPORT COMPONENTS ---
import { BotMessage, UserMessage } from '@/components/ChatMessages';
import AuthModal from '@/components/AuthModal';
import OnboardingModal from '@/components/OnboardingModal';

export default function NitiPage() {
  // --- STATE ---
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // SESSION STATE (New Magic 🪄)
  const [sessions, setSessions] = useState([]); // Sidebar List
  const [currentSessionId, setCurrentSessionId] = useState(null); // Active Chat ID

  const initialMsg = { id: 1, role: "assistant", content: "Namaste! 🙏 I am Niti.ai. Ask me anything about Indian Government schemes." };
  const [messages, setMessages] = useState([initialMsg]);
  const messagesEndRef = useRef(null);

  // --- 1. INITIAL SETUP ---
  useEffect(() => {
    if (window.innerWidth > 768) setIsSidebarOpen(true);

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleLoginSuccess(session.user);
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        handleLoginSuccess(session.user);
        setShowAuth(false);
      } else {
        handleLogoutCleanup();
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // --- 2. AUTH HANDLERS ---
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    fetchSessions(userData.id); // Login hote hi purani chats lao
    
    // Profile Check
    supabase.from('profiles').select('occupation').eq('id', userData.id).single()
      .then(({ data }) => { if (!data?.occupation) setShowOnboarding(true); });
  };

  const handleLogoutCleanup = () => {
    setUser(null);
    setSessions([]);
    setCurrentSessionId(null);
    setMessages([initialMsg]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- 3. SESSION MANAGEMENT (Sidebar Logic) ---
  
  // A. Fetch All Conversations
  const fetchSessions = async (userId) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setSessions(data);
  };

  // B. Load a Specific Chat
  const loadSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setIsLoading(true);
    
    // Fetch Messages for this session
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map(msg => ({ id: msg.id, role: msg.role, content: msg.content })));
    } else {
      setMessages([initialMsg]);
    }
    
    if (window.innerWidth < 768) setIsSidebarOpen(false); // Mobile pe sidebar band karo click ke baad
    setIsLoading(false);
  };

  // C. Start New Chat
  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([initialMsg]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // --- 4. SEND MESSAGE LOGIC (The Brain) ---
  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput("");

    // UI Update immediately
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: userText }]);
    setIsLoading(true);

    let activeSession = currentSessionId;

    try {
      // STEP A: Create Session if it doesn't exist (First Message)
      if (!activeSession && user) {
        const title = userText.slice(0, 30) + "..."; // Pehle 30 letters ko title banao
        const { data: newSession, error } = await supabase
          .from('conversations')
          .insert([{ user_id: user.id, title: title }])
          .select()
          .single();

        if (newSession) {
          activeSession = newSession.id;
          setCurrentSessionId(newSession.id);
          setSessions(prev => [newSession, ...prev]); // Sidebar update karo
        }
      }

      // STEP B: Save User Message
      if (user && activeSession) {
        await supabase.from('messages').insert([{ 
          role: "user", content: userText, user_id: user.id, conversation_id: activeSession 
        }]);
      }

      // STEP C: Call AI Backend
      const res = await fetch('https://niti-backend.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
      });
      const data = await res.json();
      const botResponse = data.response || "No response.";

      // STEP D: Save Bot Message
      if (user && activeSession) {
        await supabase.from('messages').insert([{ 
          role: "assistant", content: botResponse, user_id: user.id, conversation_id: activeSession 
        }]);
      }

      // Final UI Update
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: botResponse }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: "⚠️ Network Error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UTILS ---
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom() }, [messages, isLoading]);
  useEffect(() => { if(isDark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [isDark]);

  const startListening = () => { /* ... Voice Logic Same ... */ };

  return (
    <div className={`niti-layout ${isDark ? 'dark' : ''}`}>
      <div className="niti-bg-pattern"></div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <OnboardingModal isOpen={showOnboarding} userId={user?.id} onComplete={() => setShowOnboarding(false)} />

      {/* MOBILE OVERLAY */}
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
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X size={20}/></button>
            </div>

            <div className="px-3 mb-4 mt-4">
              <button onClick={startNewChat} className="w-full flex items-center gap-2 p-3 rounded-lg border border-[var(--sidebar-border)] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <Plus size={18} /> New Chat
              </button>
            </div>

            {/* --- SESSION LIST (REAL HISTORY) --- */}
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <p className="text-xs font-semibold opacity-50 px-2 mb-2">HISTORY</p>
              {sessions.length === 0 ? (
                <p className="text-xs text-center opacity-40 mt-4">No history yet</p>
              ) : (
                sessions.map((session) => (
                  <button 
                    key={session.id} 
                    onClick={() => loadSession(session.id)}
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
                <button onClick={() => setShowAuth(true)} className="flex items-center gap-2 text-sm dark:text-white w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><User size={18} /> Sign In</button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="niti-main w-full">
        <header className="niti-header">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded hover:bg-white/10"><Menu size={24} /></button>}
            <div><h1 className="font-bold text-lg leading-tight">Niti.ai</h1><p className="text-[10px] opacity-80">GOVT SCHEME ASSISTANT</p></div>
          </div>
          <button onClick={() => setIsDark(!isDark)} className="p-2 bg-white/10 rounded-full hover:bg-white/20">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
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
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} onFocus={scrollToBottom} placeholder="Ask about schemes..." className="flex-1 bg-transparent border-none outline-none text-sm md:text-base dark:text-white dark:placeholder:text-gray-500 text-slate-900" />
            <button onClick={startListening} className="p-2 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition shadow-lg shrink-0"><Mic size={20} /></button>
            {input.trim() && <button onClick={handleSend} className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition shrink-0"><Send size={18} /></button>}
          </div>
        </div>
      </main>
    </div>
  );
}