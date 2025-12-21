"use client"

import { Menu, Plus, MessageSquare, Info, LogIn, LogOut, Loader2, User as UserIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "../ui/sheet"
import Image from "next/image"
import { AboutDialog } from "../niti/AboutDialog"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "../providers/supabase-provider"
import { createBrowserClient } from "@supabase/ssr"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useMemo } from "react"

type HistoryItem = {
  id: string
  title: string
  created_at: string
}

export default function MobileSidebar() {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // ✅ Supabase Hook Use kiya
  const { user, session, isLoading } = useSupabase()
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => setIsMounted(true), [])

  // Load History
  useEffect(() => {
    if (user) {
      setHistoryLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000"

      fetch(`${API_BASE_URL}/history?session_id=${user.id}`) // ✅ UUID bheja
        .then(res => res.json())
        .then(data => {
          setHistory(data)
          setHistoryLoading(false)
        })
        .catch(err => {
          console.error(err)
          setHistoryLoading(false)
        })
    } else {
      setHistory([])
    }
  }, [user, isOpen]) // Menu khulte hi refresh

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleNewChat = () => {
    window.location.href = '/'
  }

  const handleHistoryClick = (chatId: string) => {
    router.push(`/?chatId=${chatId}`)
    setIsOpen(false)
  }

  if (!isMounted) return null


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-card border-r border-border/50 p-0 flex flex-col gap-0">
        <SheetTitle className="hidden">Menu</SheetTitle>
        <SheetDescription className="hidden">Nav</SheetDescription>

        {/* HEADER (Profile) */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-10 w-full animate-pulse bg-muted rounded-md" />
            ) : user ? (
              <>
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm truncate">{user.user_metadata?.full_name || "User"}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                </div>
              </>
            ) : (
              // Not Logged In
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                  <Image src="/niti-photo.webp" alt="Niti" fill className="object-cover" />
                </div>
                <span className="font-bold text-xl text-foreground">Niti.ai</span>
              </div>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <Button onClick={handleNewChat} className="w-full justify-start gap-2 bg-niti-blue hover:bg-blue-600 text-white shadow-md shadow-blue-500/10">
            <Plus size={18} /> New Chat
          </Button>

          <div className="flex flex-col gap-1 mt-2">
            <p className="text-xs text-muted-foreground font-semibold px-2 mb-2 uppercase tracking-wider">Recent Activity</p>

            {user ? (
              <>
                {historyLoading ? (
                  <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                  </div>
                ) : history.length > 0 ? (
                  history.map((item) => (
                    <Button key={item.id} variant="ghost" onClick={() => handleHistoryClick(item.id)} className="justify-start gap-2 h-auto py-2 px-2 font-normal text-muted-foreground hover:text-foreground hover:bg-muted/50 whitespace-normal text-left">
                      <MessageSquare size={14} className="shrink-0 mt-1" />
                      <span className="line-clamp-1">{item.title || "Untitled Chat"}</span>
                    </Button>
                  ))
                ) : (
                  <p className="px-2 text-sm text-muted-foreground italic">No history yet.</p>
                )}

                {/* SIGN OUT BUTTON */}
                <Button variant="ghost" onClick={handleSignOut} className="justify-start gap-2 h-10 px-2 font-normal text-red-400 hover:text-red-500 hover:bg-red-500/10 mt-4">
                  <LogOut size={16} /> Sign Out
                </Button>
              </>
            ) : (
              <div className="px-2 py-4 text-center border border-dashed border-border rounded-lg bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2">Sign in to save history.</p>
                <Link href="/login" className="w-full block" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <LogIn size={14} /> Login / Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-muted/20 border-t border-border/50">
          <AboutDialog>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3 px-2">
              <Info size={18} className="text-niti-blue" />
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