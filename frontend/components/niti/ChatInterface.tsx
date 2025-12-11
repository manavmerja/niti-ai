"use client"

import { useUser, SignInButton } from "@clerk/nextjs" // <-- Clerk Hooks
import { toast } from "sonner" 
import { CopyButton } from "../ui/copy-button" 
import TextareaAutosize from "react-textarea-autosize"
import React, { useState, useRef, useEffect } from "react"
import { MarkdownRenderer } from "../ui/markdown-renderer"
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
  const { isSignedIn } = useUser() // <-- Check login status
  
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

    // --- GUEST WARNING LOGIC ---
    // Agar user Guest hai aur ye pehla message hai, toh warn karo
    if (!isSignedIn && messages.length === 1) { 
       toast.info("Chats are not saved!", {
         description: "You are chatting as a Guest. Sign in to save history.",
         action: {
           label: "Sign In",
           onClick: () => document.getElementById('hidden-signin-btn')?.click()
         }
       })
     }

    // User Message Add
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      // Backend URL (Make sure ye sahi hai)
      const BACKEND_URL = "https://niti-backend.onrender.com/chat" 
      
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg.content }),
      })

      if (!res.ok) throw new Error("Server Error")

      const data = await res.json()
      
      setIsLoading(false) 

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: data.response 
      }
      setMessages((prev) => [...prev, aiMsg])

    } catch (error) {
      console.error(error)
      setIsLoading(false)
      
      toast.error("Connection Failed", {
        description: "Please check your internet or try again later.",
      })
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
    <div className="flex flex-col h-full w-full mx-auto relative">
      
      {/* --- CHAT SCROLL AREA --- */}
      <ScrollArea className="flex-1 p-4 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          
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
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === "ai" ? "bg-niti-blue text-white" : "bg-muted text-foreground"
                }`}>
                  {m.role === "ai" ? <Sparkles size={16} /> : <User size={16} />}
                </div>

                <div className={`relative group rounded-2xl p-4 max-w-[85%] md:max-w-[75%] shadow-sm ${
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-card border border-border/40 rounded-tl-none"
                }`}>
                  
                  {m.role === "ai" && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={m.content} />
                    </div>
                  )}

                  {m.role === "ai" ? (
                    <div className="pr-6">
                       <MarkdownRenderer content={m.content} />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* --- PULSING BRAIN LOADER --- */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex items-start gap-4"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                  boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 20px rgba(59, 130, 246, 0.6)", "0px 0px 0px rgba(59, 130, 246, 0)"]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-10 h-10 rounded-xl overflow-hidden border border-blue-500/30 bg-background"
              >
                <Image src="/niti-photo.webp" alt="Thinking..." fill className="object-cover" />
              </motion.div>
              <div className="flex flex-col justify-center h-10 space-y-1">
                <span className="text-sm font-medium text-niti-blue animate-pulse">Analyzing Schemes...</span>
                <span className="text-[10px] text-muted-foreground">Checking database for best answers</span>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* --- INPUT AREA --- */}
      <div className="absolute bottom-6 left-0 right-0 px-4">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-card/80 backdrop-blur-xl p-2 rounded-[26px] shadow-2xl border border-border/40">
          <TextareaAutosize
            minRows={1}
            maxRows={5}
            placeholder="Ask about Mudra Loan, PM Kisan..."
            className="flex-1 w-full bg-transparent border-0 focus:ring-0 resize-none outline-none text-base py-3 pl-4 pr-12 max-h-[200px] text-foreground placeholder:text-muted-foreground"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
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

      {/* --- HIDDEN SIGN IN BUTTON (Triggered by Toast) --- */}
      <div className="hidden">
         <SignInButton mode="modal">
            <button id="hidden-signin-btn">Sign In</button>
         </SignInButton>
      </div>

    </div>
  )
}