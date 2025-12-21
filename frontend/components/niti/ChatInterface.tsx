"use client"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area" // Uploaded file
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Uploaded file
import { MessageBubble } from "@/components/ui/MessageBubble" // New Component
import { Menu, Send, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ role: "user" | "ai", content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Auto-scroll ke liye ref
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom jab naya message aaye
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg = input
    setInput("")
    
    // 1. User Message Add karein
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setIsLoading(true)

    try {
      // 2. API Call (Simulated for testing)
      // Yahan aap apna fetch("/chat") wala logic lagayein
      const response = await fetch("https://niti-backend.onrender.com/chat", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ text: userMsg })
      })
      const data = await response.json()
      
      // 3. AI Response Add karein
      setMessages(prev => [...prev, { role: "ai", content: data.response }])
      
    } catch (error) {
      console.error("Error:", error)
      setMessages(prev => [...prev, { role: "ai", content: "⚠️ Connection Error. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-background flex-col">
      
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between border-b p-4 shadow-sm bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* Mobile Sidebar Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <div className="p-4 font-bold text-xl">History</div>
               {/* Yahan Sidebar/History List aayegi */}
               <div className="text-muted-foreground text-sm mt-4">No recent chats.</div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
             <Sparkles className="h-6 w-6 text-yellow-500 fill-yellow-500" />
             Niti.ai
          </div>
        </div>
      </header>

      {/* --- CHAT AREA (Scrollable) --- */}
      <ScrollArea className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-3xl space-y-6 pb-20">
          
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 opacity-50">
               <Sparkles className="h-16 w-16 text-muted-foreground" />
               <p className="text-xl font-medium">Namaste!🙏 <br/> How can I help you with Government Schemes today?</p>
            </div>
          )}

          {/* Messages Loop */}
          {messages.map((msg, index) => (
            <MessageBubble 
               key={index} 
               role={msg.role} 
               content={msg.content} 
               isLatest={index === messages.length - 1} // Sirf last message animate hoga
            />
          ))}

          {/* Loading Indicator (Typing...) */}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground ml-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs animate-pulse">Niti is thinking...</span>
            </div>
          )}

          {/* Invisible div for auto-scroll */}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-background border-t">
        <div className="mx-auto max-w-3xl flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about PM Kisan, Mudra Loan..."
            className="flex-1 bg-muted/50 border-none rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="rounded-full h-12 w-12 shrink-0" 
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

    </div>
  )
}