/**
 * Root layout — minimaliste, délègue à [locale]/layout.tsx.
 * Importe les styles globaux et configure les fonts.
 */

import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets:  ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets:  ["latin"],
})

export const metadata: Metadata = {
  title:       "MIABO — Tutorat Madagascar",
  description: "Plateforme de tutorat scolaire pour Madagascar",
  icons: {
    icon:  "/miabo-icon.svg",
    apple: "/miabo-icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
