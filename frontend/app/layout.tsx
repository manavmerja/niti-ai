import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Niti.ai",
  description: "AI Assistant for Indian Government Schemes",
  manifest: "/manifest.json", // ✅ PWA Manifest Link
  icons: {
    icon: "/logo.png",        // ✅ Browser Tab Icon (Desktop)
    shortcut: "/logo.png",
    apple: "/logo.png",       // ✅ Apple Home Screen Icon (iPhone)
  },
};

// ✅ PWA Theme Color (Mobile browser bar ka color black rahega)
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}