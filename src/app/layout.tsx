import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SplashScreenGate } from "@/common/ui/layout/SplashScreenGate/SplashScreenGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paily",
  description: "Couple task coordination app",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Paily",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192" },
    ],
    apple: {
      url: "/icons/icon-192.png",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SplashScreenGate>{children}</SplashScreenGate>
      </body>
    </html>
  );
}
