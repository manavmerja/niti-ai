"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Info, ShieldAlert, Github, Heart } from "lucide-react"
import Image from "next/image"

export function AboutDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          
          {/* Animated Logo */}
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-blue-500/20">
             <Image src="/niti-photo.webp" alt="Logo" fill className="object-cover" />
          </div>
          
          <div className="text-center">
            <DialogTitle className="text-2xl font-bold">Niti.ai</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              AI Assistant for Indian Govt Schemes
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex flex-col gap-4 py-4">
            
            {/* Disclaimer Box */}
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex gap-3 items-start">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-500">Disclaimer</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Niti.ai is an AI tool and can make mistakes. This is <strong>not</strong> an official government app. Always verify scheme details from official websites like <em>india.gov.in</em>.
                    </p>
                </div>
            </div>

            {/* Info List */}
            <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>Version</span>
                    <span className="font-mono text-foreground">v1.0.0 (Beta)</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>Developer</span>
                    <span className="text-foreground">Your Name / Team</span>
                </div>
                <div className="flex items-center justify-between">
                    <span>Tech Stack</span>
                    <span className="text-foreground">Next.js • Python • LangChain</span>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 mt-2">
            <Button className="w-full gap-2 bg-niti-blue hover:bg-blue-600 text-white">
                <Github size={16} /> View on GitHub
            </Button>
            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 mt-2">
                Made with <Heart size={10} className="text-red-500 fill-red-500" /> in India
            </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}