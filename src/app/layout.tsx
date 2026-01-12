import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "मराठी शब्दकोश - Marathi Dictionary",
  description: "Free Marathi-English dictionary with 89,000+ entries from Molesworth and Berntsen. Instant search with full definitions.",
  keywords: ["marathi dictionary", "marathi english dictionary", "मराठी शब्दकोश", "molesworth dictionary", "marathi words"],
  openGraph: {
    title: "मराठी शब्दकोश - Marathi Dictionary",
    description: "Free Marathi-English dictionary with 89,000+ entries",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
