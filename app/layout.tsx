import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from 'geist/font/sans';
import 'katex/dist/katex.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Metadata, Viewport } from "next";
import { Instrument_Serif, Syne } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL("https://mplx.run"),
  title: "Scira",
  description: "Scira is a minimalistic AI-powered search engine that helps you find information on the internet.",
  openGraph: {
    url: "https://mplx.run",
    siteName: "Scira",
  },
  keywords: [
    "Scira",
    "scira",
    "scira.how",
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
}

const syne = Syne({ 
  subsets: ['latin'], 
  variable: '--font-syne',
   preload: true,
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${syne.variable} font-sans antialiased`}>
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
