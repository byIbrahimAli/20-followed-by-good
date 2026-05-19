import type { Metadata } from "next";
import {
  Inter,
  Noto_Naskh_Arabic,
  Playfair_Display,
  Space_Mono,
} from "next/font/google";

import { starterConfig } from "../../starter.config";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
});

const arabicFont = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  weight: ["400", "500", "600", "700"],
});

const monoFont = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  description: starterConfig.app.description,
  title: starterConfig.app.name,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${arabicFont.variable} ${monoFont.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
