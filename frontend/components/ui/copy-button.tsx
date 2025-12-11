"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "./button"

export function CopyButton({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      
      // 2 Second baad wapas purana icon
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-background/20"
      onClick={handleCopy}
      title="Copy message"
    >
      {isCopied ? (
        <Check size={14} className="text-green-500" />
      ) : (
        <Copy size={14} />
      )}
    </Button>
  )
}