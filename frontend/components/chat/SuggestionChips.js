"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, CheckCircle, Globe } from 'lucide-react';

export default function SuggestionChips({ onSelect, isNewChat }) {
  
  // Logic: Agar Nayi Chat hai to ye dikhao, warna Scheme wale options dikhao
  const suggestions = isNewChat 
    ? [
        { text: "Best Schemes for Students", icon: <Sparkles size={14} /> },
        { text: "Farmers Loan Waiver", icon: <FileText size={14} /> },
        { text: "Startup India details", icon: <Globe size={14} /> }
      ]
    : [
        { text: "📄 Documents Required?", icon: <FileText size={14} /> },
        { text: "✅ Check Eligibility", icon: <CheckCircle size={14} /> },
        { text: "🌍 How to Apply?", icon: <Globe size={14} /> }
      ];

  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-1 no-scrollbar w-full justify-start md:justify-center">
      <AnimatePresence mode="wait">
        {suggestions.map((chip, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(chip.text)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#2a2a2a] border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-700 transition-all shrink-0 whitespace-nowrap"
          >
            {chip.icon}
            {chip.text}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}