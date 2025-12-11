import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { ClerkProvider } from "@clerk/nextjs"; // Auth
import { ThemeProvider } from "@/components/theme-provider"; // <-- YE MISSING THA

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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {/* ThemeProvider wapas aa gaya 👇 */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark" // Default Dark kar diya
            enableSystem
            disableTransitionOnChange
          >
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}