"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Humne 'type' import hata diya taaki error na aaye
export function ThemeProvider({ children, ...props }: any) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}