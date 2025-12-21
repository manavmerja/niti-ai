"use client"

import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { createBrowserClient } from "@supabase/ssr"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react" // ✅ useState & useEffect Import kiye

export default function LoginPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false) // ✅ Mounted State

  // Supabase Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ✅ Client-side mount check
  useEffect(() => {
    setMounted(true)
  }, [])

  // Jab tak mount na ho, tab tak kuch mat dikhao (ya Skeleton dikhao)
  // Isse Server aur Client mismatch nahi hoga
  if (!mounted) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <div className="z-10 w-full max-w-md space-y-8 rounded-2xl border border-border/50 bg-card/50 p-8 shadow-2xl backdrop-blur-xl h-[400px] animate-pulse">
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-niti-blue/20 via-background to-background pointer-events-none" />

      <div className="z-10 w-full max-w-md space-y-8 rounded-2xl border border-border/50 bg-card/50 p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl shadow-lg shadow-blue-500/20">
            <Image src="/niti-photo.webp" alt="Niti Logo" fill className="object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Niti.ai</h1>
          <p className="text-sm text-muted-foreground">Sign in to access AI government schemes.</p>
        </div>

        {/* Supabase Auth Component */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb', // Niti Blue
                  brandAccent: '#1d4ed8',
                  inputText: 'white',
                },
                radii: {
                  borderRadiusButton: '8px',
                  inputBorderRadius: '8px',
                }
              }
            },
            className: {
              button: "w-full px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              input: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            }
          }}
          providers={["google"]} 
          // ✅ Ab theme safe hai kyunki humne 'mounted' check laga diya hai
          theme={theme === "dark" ? "dark" : "default"}
          redirectTo={`${window.location.origin}/auth/callback`}
        />
      </div>
    </div>
  )
}