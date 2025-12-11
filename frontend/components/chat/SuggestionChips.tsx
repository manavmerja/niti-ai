"use client"

import { motion } from "framer-motion"
import { ArrowRight, Lightbulb, GraduationCap, Sprout, Building2 } from "lucide-react"

const suggestions = [
  { id: 1, text: "Mudra loan types?", icon: Building2, color: "bg-blue-500/10 text-blue-500" },
  { id: 2, text: "PM Kisan Samman Nidhi details", icon: Sprout, color: "bg-green-500/10 text-green-500" },
  { id: 3, text: "Scholarships for engineering", icon: GraduationCap, color: "bg-purple-500/10 text-purple-500" },
  { id: 4, text: "Startup India benefits", icon: Lightbulb, color: "bg-amber-500/10 text-amber-500" },
]

export default function SuggestionChips({ onSelect }: { onSelect: (text: string) => void }) {
  return (
// max-w-2xl ko update karke lg:max-w-4xl kar do
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl lg:max-w-4xl mt-8">
      {suggestions.map((item, index) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(item.text)}
          className="flex items-center gap-4 p-4 text-left rounded-xl border border-border/50 bg-card hover:bg-card/80 hover:border-niti-blue/50 transition-all group shadow-sm"
        >
          <div className={`p-3 rounded-lg ${item.color}`}>
            <item.icon size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground group-hover:text-niti-blue transition-colors">
              {item.text}
            </p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </motion.button>
      ))}
    </div>
  )
}