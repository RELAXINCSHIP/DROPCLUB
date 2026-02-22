import type { Metadata } from 'next'
import { Inter, Rubik_Glitch } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })
const glitchFont = Rubik_Glitch({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-glitch'
})

export const metadata: Metadata = {
  title: 'DROPCLUB | Win Cash. Win Clout.',
  description: 'The exclusive club for the top 1%.',
  manifest: '/manifest.json',
  themeColor: '#a855f7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, glitchFont.variable, "antialiased min-h-screen bg-background text-foreground")}>
        {children}
      </body>
    </html>
  )
}
