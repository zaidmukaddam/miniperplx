import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { Inter, Instrument_Serif } from 'next/font/google';
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://miniperplx.vercel.app"),
  title: "MiniPerplx",
  description: "MiniPerplx is a minimalistic AI-powered search engine that helps you find information on the internet.",
  openGraph : {
    url: "https://miniperplx.vercel.app",
    siteName: "MiniPerplx",
  }
};

const inter = Inter({
  weight: "variable",
  subsets: ["latin"],
})

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${instrumentSerif.className}`}>
        <Toaster position="top-center" richColors />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
