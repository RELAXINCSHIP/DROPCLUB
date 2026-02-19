import Link from 'next/link'
import { User, Shield, Zap, LogOut, LayoutDashboard, Database, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <Zap className="h-6 w-6 text-purple-500" />
                        <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">DROPCLUB</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/dashboard" className="flex items-center gap-2 transition-colors hover:text-purple-400 text-foreground">
                            <LayoutDashboard className="h-4 w-4" />
                            Drops
                        </Link>
                        {/* Vault is now part of the dashboard page, but let's keep a link that scrolls or just points there */}
                        <Link href="/dashboard#vault" className="flex items-center gap-2 transition-colors hover:text-purple-400 text-muted-foreground">
                            <Database className="h-4 w-4" />
                            Vault
                        </Link>
                        <Link href="/settings" className="flex items-center gap-2 transition-colors hover:text-purple-400 text-muted-foreground">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="container py-8">
                {children}
            </main>
        </div>
    )
}
