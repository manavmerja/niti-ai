"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthModal({ isOpen, onClose }) {
  
  // Google Login Logic
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Login ke baad wapas yahi aayega
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login Error:", error.message);
      alert("Login failed! Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">Niti.ai</span>
                <span className="text-xl">🇮🇳</span>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            

            {/* Content */}
            <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-sm text-slate-500 mb-6">Sign in to save your chat history and personalized schemes.</p>

            {/* Google Button */}
            <button 
              onClick={handleGoogleLogin} 
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium mb-3 flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
            >
              <Mail size={18} />
              Sign in with Google
            </button>

            
            {/* Divider */}
            <div className="text-center text-xs text-slate-400 mt-4">
              Secure Login via Supabase
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}