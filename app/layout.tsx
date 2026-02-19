import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DropClub | Win Cash. Win Clout. Win Access.',
  description: 'The exclusive club for daily drops and life-changing prizes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "antialiased min-h-screen bg-background text-foreground")}>
        {children}
      </body>
    </html>
  )
}
