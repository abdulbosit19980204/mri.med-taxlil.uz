import React from "react"
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ClientLayout } from "@/components/client-layout"
import { LanguageProvider } from "@/context/language-context"
import { AuthProvider } from "@/context/auth-context"

const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-mono",
  display: 'swap',
});

export const metadata = {
  title: "Med-Taxlil AI | MRT Tahlili",
  description: "Sun'iy intellekt yordamida MRT tasvirlarini tahlil qiluvchi zamonaviy platforma.",
  icons: {
    icon: '/favicon.svg',
  },
}

const isVercelProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <LanguageProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </LanguageProvider>
        </AuthProvider>
        {isVercelProduction && <Analytics />}
      </body>
    </html>
  )
}
