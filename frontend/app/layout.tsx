import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
// ❌ Clerk Hata diya
// import { ClerkProvider } from "@clerk/nextjs"; 

// ✅ Supabase Provider Add kiya
import SupabaseProvider from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/theme-provider";
import type { Viewport } from "next";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Niti.ai",
  description: "AI Assistant for Indian Government Schemes",
  manifest: "/manifest.json",
  icons: {
   icon: "/niti-photo.webp",      // Laptop/Desktop Tab Icon
    shortcut: "/niti-photo.webp", // Mobile Tab Icon
    apple: "/niti-photo.webp",    // Apple Devices Icon
  },
};

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
        {/* ✅ ClerkProvider hataya, SupabaseProvider lagaya */}
        <SupabaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* Note: MainLayout ke andar hum user check karenge */}
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}