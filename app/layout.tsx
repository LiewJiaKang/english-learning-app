import { Geist_Mono, Asap, Source_Sans_3, Source_Serif_4 } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@teispace/next-themes"
import { getTheme } from '@teispace/next-themes/server';
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSessionProvider } from "@/components/session-provider";
import { Metadata } from "next";

const sourceSerif4Heading = Source_Serif_4({ subsets: ['latin'], variable: '--font-heading' });

const asap = Asap({ subsets: ['latin'], variable: '--font-asap' })
const sourceSans3 = Source_Sans_3({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "ELA",
  description: "A learning app for English learners",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialTheme = await getTheme() || undefined;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, asap.variable, "font-sans", sourceSans3.variable, sourceSerif4Heading.variable)}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          storageKey="theme"
          initialTheme={initialTheme}
        >
          <AppSessionProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
