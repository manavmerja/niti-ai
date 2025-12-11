"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function Preloader() {
  return (
    <motion.div
      // Initial State (Screen par chipka hua)
      initial={{ y: 0 }}
      // Exit State (Upar slide ho jayega - Curtain Lift)
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground"
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-niti-blue/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        
        {/* 1. Pulsing Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [1, 1.1, 1], 
            opacity: 1,
            boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 30px rgba(59, 130, 246, 0.5)", "0px 0px 0px rgba(59, 130, 246, 0)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-24 h-24 rounded-3xl overflow-hidden border border-border/50 bg-card shadow-2xl"
        >
          <Image 
            src="/niti-photo.webp" // Logo Path
            alt="Niti Logo" 
            fill 
            className="object-cover"
          />
        </motion.div>

        {/* 2. Text Reveal */}
        <div className="text-center space-y-2">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold tracking-tighter"
          >
            Niti.ai
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground tracking-widest uppercase"
          >
            Initializing Intelligence...
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}