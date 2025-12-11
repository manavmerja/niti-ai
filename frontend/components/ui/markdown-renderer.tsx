"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-container text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Links styling
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-medium break-all" />
          ),
          // Lists styling (Zaruri hai taaki bullets dikhein)
          ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 space-y-1 my-2" />,
          ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 space-y-1 my-2" />,
          // Headings
          h1: ({ node, ...props }) => <h1 {...props} className="text-lg font-bold mt-4 mb-2" />,
          h2: ({ node, ...props }) => <h2 {...props} className="text-base font-bold mt-3 mb-2" />,
          h3: ({ node, ...props }) => <h3 {...props} className="text-sm font-bold mt-2 mb-1" />,
          // Bold text
          strong: ({ node, ...props }) => <strong {...props} className="font-bold text-niti-blue" />,
          // Paragraphs
          p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}