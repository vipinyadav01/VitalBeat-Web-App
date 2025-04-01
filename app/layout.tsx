import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { NotificationsProvider } from "@/components/notifications-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VitalBeat - Fitness Tracking App",
  description: "Track your fitness journey with VitalBeat",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/apple-touch-icon.png" },
  ],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NotificationsProvider>
            {children}
            <Toaster />
          </NotificationsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'