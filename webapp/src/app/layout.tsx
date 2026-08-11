import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "NCAA March Not-So-Madness | Multi-Season ML Predictor",
  description: "Multi-Season NCAA Basketball Predictor & Bracket Simulator (2003-2026)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
