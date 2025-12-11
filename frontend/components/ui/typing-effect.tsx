"use client"

import { useEffect, useState } from "react"

export function TypingEffect({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    let i = 0
    setDisplayedText("") // Reset on new text

    const intervalId = setInterval(() => {
      // Har 15ms me ek letter add karega (Fast & Smooth)
      setDisplayedText((prev) => prev + text.charAt(i))
      i++
      
      if (i >= text.length) {
        clearInterval(intervalId)
      }
    }, 15) // Speed adjust kar sakte ho (10-20ms best hai)

    return () => clearInterval(intervalId)
  }, [text])

  return <span>{displayedText}</span>
}