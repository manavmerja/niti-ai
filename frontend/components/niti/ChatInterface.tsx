"use client"

import { toast } from "sonner" 
import { CopyButton } from "../ui/copy-button" 
import TextareaAutosize from "react-textarea-autosize" // <-- NEW IMPORT
import React, { useState, useRef, useEffect } from "react"
import { MarkdownRenderer } from "../ui/markdown-renderer" // <-- Import New Component
import SuggestionChips from "../chat/SuggestionChips"
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

type Message = {
  id: string
  role: "user" | "ai"
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Namaste! 🙏 I am Niti.ai. Ask me anything about Indian Government schemes."
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim()) return

    // User Message Add
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true) // Loader Start

    try {
      const BACKEND_URL = "https://niti-backend.onrender.com/chat" // URL check kar lena
      
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg.content }),
      })

      if (!res.ok) throw new Error("Server Error")

      const data = await res.json()
      
      // Loader Stop PEHLE karenge, fir message dikhayenge
      setIsLoading(false) 

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: data.response 
      }
      setMessages((prev) => [...prev, aiMsg])

    } catch (error) {
      console.error(error)
      setIsLoading(false) // Error aate hi loader band
      
      // Chat me ganda error message dikhane ki jagah Sundar Toast dikhao
      toast.error("Connection Failed", {
        description: "Please check your internet or try again later.",
      })
    }
  }

  // Handle Enter Key (Smart Logic)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Agar User sirf ENTER dabaye -> Message Send karo
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // Nayi line mat banao
      handleSend()
    }
    // Agar SHIFT + ENTER dabaye -> Nayi line (Default behavior)
  }

  return (
    <div className="flex flex-col h-full w-full mx-auto relative">
      
      {/* --- CHAT SCROLL AREA --- */}
      <ScrollArea className="flex-1 p-4 pb-32"> {/* pb-32 diya taaki text input ke piche na chupe */}
        <div className="max-w-4xl mx-auto space-y-6"> {/* max-w-4xl rakha hai taaki reading easy ho */}
          
          {/* Greeting State */}
          {messages.length === 1 && (
            <div className="flex flex-col items-center justify-center py-10 space-y-8 mt-10">
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20"
               >
                 <Image src="/niti-photo.webp" alt="Logo" fill className="object-cover" priority />
               </motion.div>
               <div className="text-center space-y-2">
                 <h2 className="text-2xl font-bold tracking-tight">How can I help you today?</h2>
                 <p className="text-muted-foreground">Ask about loans, scholarships, or schemes.</p>
               </div>
               <SuggestionChips onSelect={(text) => {
                 setInput(text);
                 setTimeout(() => document.getElementById('send-btn')?.click(), 100);
               }} />
            </div>
          )}

          {/* Messages List */}
          <AnimatePresence mode="popLayout">
            {messages.length > 1 && messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === "ai" ? "bg-niti-blue text-white" : "bg-muted text-foreground"
                }`}>
                  {m.role === "ai" ? <Sparkles size={16} /> : <User size={16} />}
                </div>

           {/* Message Bubble */}
                <div className={`relative group rounded-2xl p-4 max-w-[85%] md:max-w-[75%] shadow-sm ${
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-card border border-border/40 rounded-tl-none"
                }`}>
                  
                  {/* --- COPY BUTTON (Sirf AI messages ke liye) --- */}
                  {m.role === "ai" && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={m.content} />
                    </div>
                  )}

                  {/* Content */}
                  {m.role === "ai" ? (
                    <div className="pr-6"> {/* Thodi padding di taaki button text ke upar na aaye */}
                       <MarkdownRenderer content={m.content} />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                  )}
                </div>

              </motion.div>
            ))}
          </AnimatePresence>

         {/* --- PULSING BRAIN LOADER (Option B) --- */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex items-start gap-4"
            >
              {/* 1. The Glowing/Pulsing Logo */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1], // Bada-Chhota hoga (Breathing)
                  opacity: [0.8, 1, 0.8], // Glow karega
                  boxShadow: [
                    "0px 0px 0px rgba(59, 130, 246, 0)", // Blue Glow Start
                    "0px 0px 20px rgba(59, 130, 246, 0.6)", // Blue Glow Max
                    "0px 0px 0px rgba(59, 130, 246, 0)"  // Blue Glow End
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative w-10 h-10 rounded-xl overflow-hidden border border-blue-500/30 bg-background"
              >
                <Image 
                  src="/niti-photo.webp" // Tumhara Logo
                  alt="Thinking..."
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* 2. Text Indicator */}
              <div className="flex flex-col justify-center h-10 space-y-1">
                <span className="text-sm font-medium text-niti-blue animate-pulse">
                  Analyzing Schemes...
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Checking database for best answers
                </span>
              </div>
            </motion.div>
          )}
          
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

     {/* --- INPUT AREA (Floating Bottom) --- */}
      <div className="absolute bottom-6 left-0 right-0 px-4">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-card/80 backdrop-blur-xl p-2 rounded-[26px] shadow-2xl border border-border/40">
          
          {/* Smart Auto-Growing Textarea */}
          <TextareaAutosize
            minRows={1}
            maxRows={5} // 5 lines ke baad scroll aayega
            placeholder="Ask about Mudra Loan, PM Kisan..."
            className="flex-1 w-full bg-transparent border-0 focus:ring-0 resize-none outline-none text-base py-3 pl-4 pr-12 max-h-[200px] text-foreground placeholder:text-muted-foreground"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Send Button (Bottom-Right aligned) */}
          <Button 
            id="send-btn"
            size="icon" 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="shrink-0 h-10 w-10 rounded-full bg-niti-blue hover:bg-blue-600 shadow-lg shadow-blue-500/20 mb-1 mr-1 transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
          </Button>
        </div>
        
        <p className="text-center text-[10px] text-muted-foreground mt-3 opacity-60">
          Niti.ai can make mistakes. Always check official govt sources.
        </p>
      </div>
    </div>
  )
}