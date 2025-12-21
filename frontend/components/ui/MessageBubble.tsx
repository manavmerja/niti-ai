"use client"

import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { TypingEffect } from "./typing-effect"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

// Markdown Styling (Phase 1)
const MarkdownComponents = {
  ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
  ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
  h1: ({ ...props }) => <h1 className="text-2xl font-bold mb-4 mt-2" {...props} />,
  h2: ({ ...props }) => <h2 className="text-xl font-bold mb-3 mt-2" {...props} />,
  h3: ({ ...props }) => <h3 className="text-lg font-bold mb-2 mt-2" {...props} />,
  a: ({ ...props }) => <a className="text-blue-500 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
  table: ({ ...props }) => <div className="overflow-x-auto my-4 border rounded-lg"><table className="w-full text-sm text-left" {...props} /></div>,
  th: ({ ...props }) => <th className="bg-muted/50 px-4 py-2 border font-bold" {...props} />,
  td: ({ ...props }) => <td className="px-4 py-2 border" {...props} />,
  strong: ({ ...props }) => <strong className="font-bold text-primary" {...props} />,
}

interface MessageBubbleProps {
  role: "user" | "ai"
  content: string
  isLatest?: boolean // Sirf latest message par typing effect chalega
}

export function MessageBubble({ role, content, isLatest }: MessageBubbleProps) {
  const [showTyping, setShowTyping] = useState(isLatest && role === "ai")

  // Agar user ka message hai ya purana message hai, toh typing effect nahi chahiye
  useEffect(() => {
    if (!isLatest) setShowTyping(false)
  }, [isLatest])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-5 py-3 shadow-sm text-sm md:text-base leading-relaxed",
          role === "user"
            ? "bg-primary text-primary-foreground rounded-br-none" // User Bubble
            : "bg-card border text-card-foreground rounded-bl-none shadow-md" // AI Bubble
        )}
      >
        {role === "ai" ? (
          // AI ke liye Markdown Support
          <div className="prose prose-sm dark:prose-invert max-w-none">
             <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                components={MarkdownComponents}
             >
                {content}
             </ReactMarkdown>
          </div>
        ) : (
          // User ke liye Simple Text
          content
        )}
      </div>
    </motion.div>
  )
}