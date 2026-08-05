import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "FitTech — Where every fit is perfect",
  description:
    "Try on clothes virtually. Upload a photo of yourself and a garment, and FitTech will digitally fit the outfit on you.",
  icons: { icon: "/fit-tech.ico" },
}

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>{children}</body>
    </html>
  )
}
