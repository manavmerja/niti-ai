"use client"

// Ensure path is correct based on your folder structure
import Image from "next/image"
import SuggestionChips from "../chat/SuggestionChips" 
import React, { useState, useRef, useEffect } from "react"
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { TypingEffect } from "../ui/typing-effect" // Path check kar lena

// --- TYPES ---
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

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // --- HANDLE SEND ---
  const handleSend = async () => {
    if (!input.trim()) return

    // 1. Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      // NOTE: Jab Render LIVE ho jaye, tab ye URL change karna padega
      const res = await fetch("http://127.0.0.1:10000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg.content }),
      })

      const data = await res.json()

      // 3. Add AI Message
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: data.response || "Sorry, I couldn't connect to the server." 
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [...prev, { id: "err", role: "ai", content: "⚠️ Backend connection failed. Is Flask running?" }])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter Key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full w-full mx-auto">
      
      {/* --- CHAT AREA --- */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 pb-4 min-h-[calc(100vh-180px)]"> 
          
          {/* A. GREETING STATE */}
          {messages.length === 1 && (
            <div className="flex flex-col items-center justify-center py-10 space-y-8 mt-10">
               {/* Logo Animation */}
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ type: "spring", stiffness: 200, damping: 10 }}
                 className="relative w-24 h-24 flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20"
               >
                 <Image 
                   src="/niti-photo.webp" // <-- Naam check kar lena
                   alt="Niti Logo"
                   width={100} 
                   height={100}
                   className="object-cover"
                   priority // Isse fast load hoga
                 />
               </motion.div>

               <div className="text-center space-y-2">
                 <h2 className="text-2xl font-bold tracking-tight text-foreground">How can I help you today?</h2>
                 <p className="text-muted-foreground">Ask about loans, scholarships, or schemes.</p>
               </div>

               {/* Suggestions Component */}
               <SuggestionChips onSelect={(text) => {
                 setInput(text);
                 // Thoda delay taaki input me text dikhe fir send ho
                 setTimeout(() => document.getElementById('send-btn')?.click(), 100);
               }} />
            </div>
          )}

          {/* B. MESSAGES LIST (Jab chat shuru ho jaye) */}
          {messages.length > 1 && (
            <AnimatePresence mode="popLayout">
              {messages.map((m) => (
                 <motion.div
                   key={m.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                 >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      m.role === "ai" ? "bg-niti-blue text-white shadow-lg shadow-blue-500/20" : "bg-muted text-foreground"
                    }`}>
                      {m.role === "ai" ? <Sparkles size={16} /> : <User size={16} />}
                    </div>

                    {/* Bubble */}
                    <div className={`rounded-2xl p-4 max-w-[85%] text-sm leading-relaxed shadow-sm ${
                      m.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-card border border-border/50 rounded-tl-none"
                    }`}>
                      {/* Note: whitespace-pre-wrap helps bullet points formatting */}
                      <div className="whitespace-pre-wrap font-sans">
                       {/* Agar message AI ka hai, to Typing Effect dikhao, warna direct text */}
                         {m.role === "ai" ? (
                                   <TypingEffect text={m.content} />
                         ) : (
                               m.content
                         )}
                      </div>
                    </div>
                 </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* C. LOADING INDICATOR */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-niti-blue/20 text-niti-blue rounded-full flex items-center justify-center animate-pulse">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="animate-pulse">Analyzing Schemes...</span>
                <Loader2 className="w-3 h-3 animate-spin" />
              </div>
            </motion.div>
          )}
          
          {/* Scroll Anchor */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* --- INPUT AREA (Fixed at Bottom) --- */}
      <div className="p-4 bg-background/80 backdrop-blur-lg border-t border-border/40 sticky bottom-0 z-10">
        <div className="relative flex items-center gap-2 w-full">
          <Input 
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Mudra Loan, PM Kisan..." 
            className="pr-14 py-6 rounded-full shadow-lg border-border/50 focus-visible:ring-niti-blue/50 bg-card/50 w-full pl-6 text-base"
          />
          <Button 
            id="send-btn" // ID for auto-click
            size="icon" 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 rounded-full h-10 w-10 bg-niti-blue hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
          </Button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-3 opacity-60">
          Niti.ai can make mistakes. Always check official govt sources.
        </p>
      </div>

    </div>
  )
}