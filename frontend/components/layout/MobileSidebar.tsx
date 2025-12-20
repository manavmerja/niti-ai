"use client"

import { Menu, Plus, MessageSquare, Info, LogIn, LogOut, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "../ui/sheet"
import Image from "next/image"
import { AboutDialog } from "../niti/AboutDialog"
import Link from "next/link"
import { SignedIn, SignedOut, UserButton, useUser, useClerk } from "@clerk/nextjs"
// 1. useEffect aur useState pehle se import hain, sahi hai.
import { useEffect, useState } from "react"
import { toast } from "sonner"

type HistoryItem = {
  id: number
  content: string
  created_at: string
}

export default function MobileSidebar() {
  // ✅ 2. Mounting State Add karein (Server/Client mismatch rokne ke liye)
  const [isMounted, setIsMounted] = useState(false);

  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  // ✅ 3. Component Mount hone par true set karein
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isSignedIn && user) {
        setLoading(true)
        fetch(`https://niti-backend.onrender.com/history?session_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                setHistory(data)
                setLoading(false)
            })
            .catch(err => {
                console.error("Failed to load history", err)
                setLoading(false)
            })
    }
  }, [isSignedIn, user])

  // ✅ 4. Jab tak Browser pe load na ho, null return karein
  // Isse Server aur Client ki IDs ka jhagda khatam ho jayega.
  if (!isMounted) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      {/* ... Baaki ka code same rahega ... */}
      <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-card border-r border-border/50 p-0 flex flex-col gap-0">
         {/* ... Content same ... */}
         
         {/* Bas SheetContent ke closing tag tak sab same */}
         <SheetTitle className="hidden">Mobile Navigation Menu</SheetTitle>
         <SheetDescription className="hidden">Navigation menu.</SheetDescription>

        {/* --- HEADER --- */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <SignedIn>
               <div className="scale-125"><UserButton afterSignOutUrl="/" /></div>
               <div className="flex flex-col">
                 <span className="font-bold text-sm truncate max-w-[180px]">{user?.fullName || "User"}</span>
                 <span className="text-[10px] text-muted-foreground">Free Plan</span>
               </div>
            </SignedIn>
            <SignedOut>
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                 <Image src="/niti-photo.webp" alt="Niti Logo" width={32} height={32} className="object-cover" />
              </div>
              <span className="font-bold text-xl text-foreground">Niti.ai</span>
            </SignedOut>
          </div>
        </div>

        {/* --- BODY --- */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <Button onClick={() => window.location.reload()} className="w-full justify-start gap-2 bg-niti-blue hover:bg-blue-600 text-white shadow-md shadow-blue-500/10">
                <Plus size={18} /> New Chat
            </Button>

            <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs text-muted-foreground font-semibold px-2 mb-2 uppercase tracking-wider">Recent Activity</p>
                
                <SignedIn>
                  {loading ? (
                      <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                      </div>
                  ) : history.length > 0 ? (
                      history.map((item) => (
                          <Button key={item.id} variant="ghost" className="justify-start gap-2 h-auto py-2 px-2 font-normal text-muted-foreground hover:text-foreground hover:bg-muted/50 whitespace-normal text-left">
                              <MessageSquare size={14} className="shrink-0 mt-1" /> 
                              <span className="line-clamp-1">{item.content}</span>
                          </Button>
                      ))
                  ) : (
                      <p className="px-2 text-sm text-muted-foreground italic">No history yet.</p>
                  )}

                  <Button variant="ghost" onClick={() => signOut({ redirectUrl: '/' })} className="justify-start gap-2 h-10 px-2 font-normal text-red-400 hover:text-red-500 hover:bg-red-500/10 mt-4">
                      <LogOut size={16} /> Sign Out
                  </Button>
                </SignedIn>

                <SignedOut>
                   <div className="px-2 py-4 text-center border border-dashed border-border rounded-lg bg-muted/20">
                      <p className="text-xs text-muted-foreground mb-2">Sign in to save your chat history.</p>
                      <Link href="/sign-in" className="w-full block">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                           <LogIn size={14} /> Sign In
                        </Button>
                      </Link>
                   </div>
                </SignedOut>
            </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 bg-muted/20 border-t border-border/50">
            <AboutDialog>
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-niti-blue/10 flex items-center justify-center text-niti-blue"><Info size={18} /></div>
                    <div className="flex flex-col items-start text-left">
                        <span className="font-medium text-sm">About Niti.ai</span>
                        <span className="text-[10px] text-muted-foreground">v1.0 • Made with ❤️ in India</span>
                    </div>
                </Button>
            </AboutDialog>
        </div>

      </SheetContent>
    </Sheet>
  )
}