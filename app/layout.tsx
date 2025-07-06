import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Global Orion - MLM Platform",
  description: "Nigeria's #1 MLM Platform - Build Your Financial Future",
  keywords: "MLM, Multi-Level Marketing, Nigeria, Financial Freedom, Global Orion",
  authors: [{ name: "Global Orion Team" }],
  creator: "Global Orion",
  publisher: "Global Orion",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://globalorion.com",
    title: "Global Orion - MLM Platform",
    description: "Nigeria's #1 MLM Platform - Build Your Financial Future",
    siteName: "Global Orion",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Orion - MLM Platform",
    description: "Nigeria's #1 MLM Platform - Build Your Financial Future",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
