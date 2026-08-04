import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/Navbar";

export const metadata: Metadata = {
  title: "NCAA March Not-So-Madness | Predictor & Analytics",
  description: "AI-powered NCAA March Madness prediction engine, tournament simulator, and team analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <footer className="w-full py-4 text-center border-t border-white/10 text-xs text-white/60 bg-black/30 font-mono">
          NCAA March Not-So-Madness Predictor &bull; HUJI Machine Learning Project
        </footer>
      </body>
    </html>
  );
}
