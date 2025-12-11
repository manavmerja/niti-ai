"use client"

import React from "react"
import { ModeToggle } from "../mode-toggle"
import Image from "next/image"
import MobileSidebar from "./MobileSidebar"
import { Toaster } from "../ui/sonner" // <-- NEW IMPORT

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground transition-colors duration-300">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div className="flex items-center gap-3">
             <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                <Image src="/niti-photo.webp" alt="Niti Logo" width={32} height={32} className="object-cover" />
             </div>
             <span className="font-bold text-xl tracking-tight hidden md:block">Niti.ai</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <ModeToggle />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden relative w-full flex flex-col">
        <div className="w-full h-full max-w-3xl lg:max-w-6xl mx-auto flex flex-col transition-all duration-300">
          {children}
        </div>
      </main>

      {/* --- TOASTER ADDED HERE (Global) --- */}
      <Toaster position="top-center" richColors />
    </div>
  )
}