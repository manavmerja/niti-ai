import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
// ❌ Clerk Hata diya
// import { ClerkProvider } from "@clerk/nextjs"; 

// ✅ Supabase Provider Add kiya
import SupabaseProvider from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Niti.ai",
  description: "AI Assistant for Indian Government Schemes",
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