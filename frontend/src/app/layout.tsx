import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Supply Chain Analytics",
  description: "Supply Chain Analytics Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-neutral-50 flex h-screen overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-neutral-900/40 p-4 md:p-8 relative">
          {/* Glassmorphism background effect */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-neutral-800/20 to-transparent -z-10 pointer-events-none" />
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
