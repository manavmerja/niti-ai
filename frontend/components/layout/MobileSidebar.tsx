"use client"

import { Menu, Plus, MessageSquare, Info, LogIn, LogOut } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../ui/sheet"
import Image from "next/image"
import { AboutDialog } from "../niti/AboutDialog"
// Clerk Imports (Auth ke liye)
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useClerk } from "@clerk/nextjs"

export default function MobileSidebar() {
  const { user } = useUser(); // User ka data lene ke liye
  const { signOut } = useClerk(); // <-- Sign Out function yahan se milega

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-card border-r border-border/50 p-0 flex flex-col gap-0">
        
        {/* --- HEADER --- */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            
            {/* AGAR LOGGED IN HAI: Profile Dikhao */}
            <SignedIn>
               <div className="scale-125">
                 <UserButton afterSignOutUrl="/" />
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-sm truncate max-w-[180px]">{user?.fullName || "User"}</span>
                 <span className="text-[10px] text-muted-foreground">Free Plan</span>
               </div>
            </SignedIn>

            {/* AGAR GUEST HAI: Logo Dikhao */}
            <SignedOut>
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                 <Image src="/niti-photo.webp" alt="Niti Logo" width={32} height={32} className="object-cover" />
              </div>
              <SheetTitle className="font-bold text-xl text-foreground">Niti.ai</SheetTitle>
            </SignedOut>
          </div>
        </div>

        {/* --- BODY --- */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            
            <Button 
                onClick={() => window.location.reload()} 
                className="w-full justify-start gap-2 bg-niti-blue hover:bg-blue-600 text-white shadow-md shadow-blue-500/10"
            >
                <Plus size={18} /> New Chat
            </Button>

            {/* HISTORY SECTION */}
            <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs text-muted-foreground font-semibold px-2 mb-2 uppercase tracking-wider">Recent</p>
                
                <SignedIn>
                  {/* Saved Chat Button */}
                  <Button variant="ghost" className="justify-start gap-2 h-10 px-2 font-normal text-muted-foreground hover:text-foreground hover:bg-muted/50">
                      <MessageSquare size={16} /> My Saved Chat...
                  </Button>
                  
                  {/* --- NEW LOGOUT BUTTON (FIXED) --- */}
                  <Button 
                      variant="ghost" 
                      onClick={() => signOut({ redirectUrl: '/' })}
                      className="justify-start gap-2 h-10 px-2 font-normal text-red-400 hover:text-red-500 hover:bg-red-500/10 mt-2"
                  >
                      <LogOut size={16} /> Sign Out
                  </Button>
                </SignedIn>

                <SignedOut>
                   {/* Guest ke liye Warning Box */}
                   <div className="px-2 py-4 text-center border border-dashed border-border rounded-lg bg-muted/20">
                      <p className="text-xs text-muted-foreground mb-2">Sign in to save your chat history.</p>
                      <SignInButton mode="modal">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                           <LogIn size={14} /> Sign In
                        </Button>
                      </SignInButton>
                   </div>
                </SignedOut>
            </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 bg-muted/20 border-t border-border/50">
            <AboutDialog>
                <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-auto py-3 hover:bg-background transition-all group px-2"
                >
                    <div className="w-9 h-9 rounded-full bg-niti-blue/10 flex items-center justify-center text-niti-blue group-hover:bg-niti-blue group-hover:text-white transition-colors">
                        <Info size={18} />
                    </div>
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