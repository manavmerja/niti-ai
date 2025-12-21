"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { type User, type Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type SupabaseContext = {
  user: User | null
  session: Session | null
  isLoading: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Client-Side Supabase Client (Browser ke liye)
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  useEffect(() => {
    // 1. Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Session check failed", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // 2. Listen for auth changes (Login, Logout, Auto-refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      // Auto-Refresh Logic (Optional but good)
      if (event === 'SIGNED_IN') router.refresh()
      if (event === 'SIGNED_OUT') {
        router.refresh()
        router.push('/login') // Logout hote hi Login page par bhejo
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return (
    <Context.Provider value={{ user, session, isLoading }}>
      {children}
    </Context.Provider>
  )
}

// Custom Hook (useUser replacement)
export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}