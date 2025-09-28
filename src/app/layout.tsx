import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNavigation from "@/common/BottomNavigation";
import Header from "@/common/Header";
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
  title: "This is a title",
  description: "This is a description",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: {
      url: "/favicon.svg",
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
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-1 overflow-y-auto pb-24 pt-14">
            {children}
          </main>
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
