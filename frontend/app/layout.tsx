import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { ClerkProvider } from "@clerk/nextjs"; 

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
      <html lang="en">
        <body className={inter.className}>
          <MainLayout>
            {children}
          </MainLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}