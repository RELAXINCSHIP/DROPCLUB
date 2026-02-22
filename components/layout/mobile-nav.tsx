'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Gamepad, Database, Trophy, User } from 'lucide-react'

const NAV_ITEMS = [
    { href: '/dashboard', icon: TrendingUp, label: 'Drops' },
    { href: '/dashboard/arcade', icon: Gamepad, label: 'Arcade' },
    { href: '/dashboard/vault', icon: Database, label: 'Vault' },
    { href: '/dashboard/leaderboard', icon: Trophy, label: 'Ranks' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${isActive
                                    ? 'text-purple-400'
                                    : 'text-zinc-500 active:text-zinc-300'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' : ''}`} />
                            <span className="text-[10px] font-bold">{label}</span>
                            {isActive && (
                                <div className="absolute -top-0 w-8 h-0.5 bg-purple-500 rounded-full" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
