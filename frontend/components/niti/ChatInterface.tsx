"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

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
  }, [messages])

  // --- HANDLE SEND ---
  const handleSend = async () => {
    if (!input.trim()) return

    // 1. Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      // 2. Call Backend (Flask)
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
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
      
      {/* --- CHAT AREA --- */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 pb-4">
          <AnimatePresence mode="popLayout">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "ai" ? "bg-niti-blue text-white shadow-blue-500/30 shadow-lg" : "bg-muted text-foreground"
                }`}>
                  {m.role === "ai" ? <Sparkles size={16} /> : <User size={16} />}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl p-4 max-w-[85%] text-sm leading-relaxed shadow-sm ${
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-card border border-border/50 rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Animation (Thinking...) */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-niti-blue/20 text-niti-blue rounded-full flex items-center justify-center animate-pulse">
                <Bot size={16} />
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                Niti is thinking <Loader2 className="w-3 h-3 animate-spin" />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

     // Sirf Input wala part confirm kar lo
<div className="p-4 bg-background/80 backdrop-blur-lg border-t border-border/40 sticky bottom-0">
  <div className="relative flex items-center gap-2 w-full"> {/* w-full add kiya */}
    <Input 
      value={input}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Ask about Mudra Loan, PM Kisan..." 
      className="pr-12 py-6 rounded-full shadow-lg border-border/50 focus-visible:ring-niti-blue/50 bg-card/50 w-full"
    />
    <Button 
      size="icon" 
      onClick={handleSend}
      disabled={isLoading || !input.trim()}
      className="absolute right-2 rounded-full h-10 w-10 bg-niti-blue hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center"
    >
      {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
    </Button>
  </div>
  {/* Footer Text */}
  <p className="text-center text-[10px] text-muted-foreground mt-2 opacity-60">
    AI can make mistakes. Verify with official sources.
  </p>
</div>

    </div>
  )
}