import "./globals.css";
import 'katex/dist/katex.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { Inter, Instrument_Serif, IBM_Plex_Mono } from 'next/font/google';
import { Analytics } from "@vercel/analytics/react";
import { Providers } from './providers'

export const metadata: Metadata = {
  metadataBase: new URL("https://mplx.run"),
  title: "MiniPerplx",
  description: "MiniPerplx is a minimalistic AI-powered search engine that helps you find information on the internet.",
  openGraph: {
    url: "https://mplx.run",
    siteName: "MiniPerplx",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const inter = Inter({
  weight: "variable",
  subsets: ["latin"],
})

const plexMono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono"
})

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif"
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${instrumentSerif.className} ${plexMono.className}`}>
        <Providers>
          <Toaster position="top-center" richColors />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
