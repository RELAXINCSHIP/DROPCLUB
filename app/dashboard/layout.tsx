import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Zap, TrendingUp, Archive, Settings, LogOut, Gamepad, LayoutDashboard, Database, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Extended Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-small-white/[0.05] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            </div>

            <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="hidden md:block bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent font-[family-name:var(--font-glitch)] text-2xl tracking-widest">DROPCLUB</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/dashboard" className="flex items-center gap-2 transition-colors hover:text-purple-400 text-zinc-400 hover:text-white">
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Drops</span>
                        </Link>
                        <Link href="/dashboard/arcade" className="flex items-center gap-2 transition-colors hover:text-pink-400 text-zinc-400 hover:text-white group">
                            <Gamepad className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                            <span className="relative">
                                <span className="hidden sm:inline">Arcade</span>
                                <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                            </span>
                        </Link>
                        <Link href="/dashboard/vault" className="flex items-center gap-2 transition-colors hover:text-yellow-400 text-zinc-400">
                            <Database className="h-4 w-4" />
                            <span className="hidden sm:inline">Vault</span>
                        </Link>
                        <Link href="/dashboard/leaderboard" className="flex items-center gap-2 transition-colors hover:text-orange-400 text-zinc-400">
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Ranks</span>
                        </Link>
                        <Link href="/settings" className="flex items-center gap-2 transition-colors hover:text-blue-400 text-zinc-400 hover:text-white">
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="container py-8 relative z-10">
                {children}
            </main>
        </div>
    )
}
