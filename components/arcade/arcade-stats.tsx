'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Coins } from 'lucide-react'
import { toast } from 'sonner'

interface ArcadeStatsProps {
    points: number
    streak: number
    lifetimePoints: number
}

export function ArcadeStats({ points: initialPoints, streak: initialStreak, lifetimePoints: initialLifetime }: ArcadeStatsProps) {
    const [points, setPoints] = useState(initialPoints)
    const [streak, setStreak] = useState(initialStreak)
    const [lifetimePoints, setLifetimePoints] = useState(initialLifetime)
    const supabase = createClient()

    useEffect(() => {
        const fetchStats = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('points, streak_days, lifetime_points')
                .eq('id', user.id)
                .single()

            if (profile) {
                setPoints(profile.points || 0)
                setStreak(profile.streak_days || 0)
                setLifetimePoints(profile.lifetime_points || 0)

                // Debugging / User Feedback
                if (profile.points !== initialPoints) {
                    console.log('Points synced:', profile.points)
                }
            }
        }

        fetchStats()
        // Optional: Set up a small interval or focus listener if we really want to be aggressive
        // But mount fetch should be enough for the "Back" navigation case
    }, [])

    // Refresh display if server props change (e.g. on router.refresh())
    useEffect(() => {
        setPoints(initialPoints)
        setStreak(initialStreak)
        setLifetimePoints(initialLifetime)
    }, [initialPoints, initialStreak, initialLifetime])

    // Calculate Rank based on lifetime points
    const getRank = (pts: number) => {
        if (pts >= 1000) return { name: "LEGEND", color: "text-yellow-400" }
        if (pts >= 500) return { name: "VIP GOLD", color: "text-amber-200" }
        if (pts >= 250) return { name: "HIGH ROLLER", color: "text-purple-300" }
        if (pts >= 100) return { name: "CONSISTENT", color: "text-blue-300" }
        return { name: "ROOKIE", color: "text-zinc-400" }
    }

    const rank = getRank(lifetimePoints)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Points Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-6 rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-md overflow-hidden group"
            >
                <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 via-transparent to-transparent opacity-50" />
                <div className="relative flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Available Points</p>
                        <h3 className="text-3xl font-black text-white mt-1 group-hover:scale-105 transition-transform">{points.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400">
                        <Coins className="w-8 h-8" />
                    </div>
                </div>
            </motion.div>

            {/* Streak Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative p-6 rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-md overflow-hidden group"
            >
                <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-transparent opacity-50" />
                <div className="relative flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Day Streak</p>
                        <h3 className="text-3xl font-black text-white mt-1 group-hover:scale-105 transition-transform">{streak} <span className="text-base font-normal text-zinc-500">Days</span></h3>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400">
                        <Flame className="w-8 h-8 animate-pulse" />
                    </div>
                </div>
            </motion.div>

            {/* Rank Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative p-6 rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-md overflow-hidden group"
            >
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-transparent opacity-50" />
                <div className="relative flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Current Rank</p>
                        <h3 className={`text-3xl font-black mt-1 group-hover:scale-105 transition-transform ${rank.color} font-[family-name:var(--font-glitch)] tracking-widest`}>
                            {rank.name}
                        </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                        <Trophy className="w-8 h-8" />
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
