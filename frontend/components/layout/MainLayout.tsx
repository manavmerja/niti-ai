"use client"
import React from "react"
import { ModeToggle } from "../mode-toggle"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-niti-blue rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          {/* Typo fixed: Niti.ai */}
          <span className="font-bold text-xl tracking-tight">Niti.ai</span>
        </div>
        <ModeToggle />
      </header>

      {/* MAIN CONTENT AREA - Centered for Mobile/Desktop */}
      <main className="flex-1 overflow-hidden relative w-full flex flex-col">
        {/* Is div ki wajah se chat center me rahegi */}
        <div className="w-full h-full max-w-2xl mx-auto flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}