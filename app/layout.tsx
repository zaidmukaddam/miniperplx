import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { Inter, Instrument_Serif } from 'next/font/google';
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://miniperplx.za16.co"),
  title: "MiniPerplx",
  description: "MiniPerplx is a minimalistic AI-powered search engine that helps you find information on the internet.",
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
