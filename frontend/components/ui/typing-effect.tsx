"use client"

import { useEffect, useState } from "react"

interface TypingEffectProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export function TypingEffect({ text, speed = 10, onComplete }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    let i = 0
    setDisplayedText("") 

    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i))
      i++
      
      if (i >= text.length) {
        clearInterval(intervalId)
        if (onComplete) onComplete()
      }
    }, speed)

    return () => clearInterval(intervalId)
  }, [text, speed, onComplete])

  return <span>{displayedText}</span>
}