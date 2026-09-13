import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LocalRAG | AI Knowledge Assistant",
  description: "Transform your scattered notes into a structured knowledge engine. Our AI understands your context and surfaces insights instantly.",
  openGraph: {
    title: "LocalRAG | AI Knowledge Assistant",
    description: "Transform your scattered notes into a structured knowledge engine.",
    siteName: "LocalRAG",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LocalRAG | AI Knowledge Assistant",
    description: "Transform your scattered notes into a structured knowledge engine.",
  },
  keywords: ["LocalRAG", "AI", "Knowledge Management", "RAG", "Productivity"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
