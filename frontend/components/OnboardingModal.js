"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function OnboardingModal({ isOpen, userId, onComplete }) {
  const [role, setRole] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!role || !state) return alert("Please select both options");
    setLoading(true);

    try {
      // Supabase me Profile Update karo
      const { error } = await supabase
        .from('profiles')
        .update({ 
          occupation: role, 
          state: state,
          updated_at: new Date()
        })
        .eq('id', userId);

      if (error) throw error;
      
      onComplete(); // Modal band karo
    } catch (error) {
      console.error("Update Error:", error);
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
      >
        <div className="mb-6">
          <span className="text-4xl">👋</span>
          <h2 className="text-2xl font-bold mt-4 dark:text-white">Namaste!</h2>
          <p className="text-slate-500 dark:text-slate-400">Help Niti.ai serve you better.</p>
        </div>

        <div className="space-y-4 text-left">
          
          {/* Role Selection */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase px-1">You are a...</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {['Student', 'Farmer', 'Business', 'Citizen'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    role === r 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                      : 'border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {role === r && <Check size={14} />} {r}
                </button>
              ))}
            </div>
          </div>

          {/* State Input */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Your State</label>
            <div className="flex items-center gap-2 mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <MapPin size={18} className="text-slate-400" />
              <select 
                className="bg-transparent w-full outline-none text-slate-800 dark:text-white text-sm"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">Select State</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="UP">Uttar Pradesh</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg disabled:opacity-50"
        >
          {loading ? "Saving..." : "Get Started 🚀"}
        </button>

      </motion.div>
    </div>
  );
}