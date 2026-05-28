import { Geist_Mono, Merriweather, Asap } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSessionProvider } from "@/components/session-provider";

const merriweatherHeading = Merriweather({ subsets: ['latin'], variable: '--font-heading' });

const asap = Asap({ subsets: ['latin'], variable: '--font-sans' })

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
      className={cn("antialiased", fontMono.variable, "font-sans", asap.variable, merriweatherHeading.variable)}
    >
      <body>
        <AppSessionProvider>
          <ThemeProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </ThemeProvider>
        </AppSessionProvider>
      </body>
    </html>
  )
}
