import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from 'geist/font/sans';
import 'katex/dist/katex.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Metadata, Viewport } from "next";
import { Instrument_Serif } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL("https://mplx.run"),
  title: "MiniPerplx",
  description: "MiniPerplx is a minimalistic AI-powered search engine that helps you find information on the internet.",
  openGraph: {
    url: "https://mplx.run",
    siteName: "MiniPerplx",
  },
  keywords: [
    "MiniPerplx",
    "mplx",
    "mplx.run",
    "search engine",
    "AI",
    "ai search engine",
    "perplexity",
    "minimalistic search engine",
  ]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000" },
    { media: "(prefers-color-scheme: light)", color: "#fff" },
  ]
}

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ['normal', 'italic'],
  variable: "--font-serif",
  preload: true,
  display: 'swap',
  fallback: ['sans-serif'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        <NuqsAdapter>
          <Providers>
            <Toaster position="top-center" richColors />
            {children}
          </Providers>
        </NuqsAdapter>
        <Analytics />
      </body>
    </html>
  );
}
