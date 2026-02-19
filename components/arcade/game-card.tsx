'use client'

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import Link from 'next/link'

interface GameCardProps {
    title: string
    description: string
    icon: React.ReactNode
    color: string
    href: string
    delay?: number
}

export function GameCard({ title, description, icon, color, href, delay = 0 }: GameCardProps) {
    return (
        <Link href={href}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay }}
                className="group relative h-64 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm overflow-hidden hover:border-white/30 transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1"
            >
                {/* Background Gradient */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-linear-to-br ${color}`} />

                <div className="relative h-full flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className={`mb-6 p-4 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]`}>
                        {icon}
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">{title}</h3>
                    <p className="text-zinc-400 text-sm max-w-[200px]">{description}</p>

                    {/* Play Button Overlay */}
                    <div className="absolute bottom-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span className="flex items-center gap-2 text-white font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
                            <Play className="w-4 h-4 fill-current" /> PLAY NOW
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}
