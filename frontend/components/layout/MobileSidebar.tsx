"use client"

import { AboutDialog } from "../niti/AboutDialog" // Check path
import { Menu, Plus, MessageSquare, Info } from "lucide-react"
import { Button } from "../ui/button"
// IMPORT UPDATE: 'SheetTitle' add kiya
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../ui/sheet" 
import Image from "next/image"

export default function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-card border-r border-border/50 p-0 flex flex-col gap-0">
        
        {/* --- HEADER (Fixed Title Here) --- */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
               <Image src="/niti-photo.webp" alt="Niti Logo" width={32} height={32} className="object-cover" />
            </div>
            {/* FIX: span ko hata kar SheetTitle laga diya */}
            <SheetTitle className="font-bold text-xl text-foreground">Niti.ai</SheetTitle>
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

            <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs text-muted-foreground font-semibold px-2 mb-2 uppercase tracking-wider">Recent</p>
                <Button variant="ghost" className="justify-start gap-2 h-10 px-2 font-normal text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <MessageSquare size={16} /> Mudra Loan Info...
                </Button>
            </div>
        </div>

       {/* --- FOOTER (Full Width / Edge-to-Edge) --- */}
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
                <span className="text-[10px] text-muted-foreground">v1.0.0 • Made by Manav Merja</span>
            </div>
        </Button>
    </AboutDialog>
</div>

      </SheetContent>
    </Sheet>
  )
}