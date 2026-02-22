'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Gift } from 'lucide-react'
import { checkLoginStreak } from '@/app/actions/engagement'
import { toast } from 'sonner'

export function StreakBanner() {
    const [streak, setStreak] = useState<number>(0)
    const [bonus, setBonus] = useState<number>(0)
    const [show, setShow] = useState(false)

    useEffect(() => {
        const check = async () => {
            try {
                const result = await checkLoginStreak()
                if (!result) return

                setStreak(result.streak)

                if (!result.alreadyClaimed && result.bonus > 0) {
                    setBonus(result.bonus)
                    setShow(true)
                    toast.success(`🔥 ${result.streak}-day streak! +${result.bonus} PTS bonus!`)
                    setTimeout(() => setShow(false), 6000)
                }
            } catch (e) {
                // Silently fail - streak tables might not exist yet
                console.log('Streak check skipped:', e)
            }
        }
        check()
    }, [])

    if (streak <= 0) return null

    return (
        <>
            {/* Persistent streak indicator */}
            <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-full border border-orange-500/20">
                    <Flame className="w-4 h-4" />
                    <span className="font-bold">{streak} Day Streak</span>
                </div>
                {streak >= 3 && (
                    <span className="text-zinc-500 text-xs">
                        {streak >= 30 ? '⭐ +100 PTS/day' : streak >= 7 ? '🔥 +20 PTS/day' : '+5 PTS/day'}
                    </span>
                )}
            </div>

            {/* Bonus popup */}
            <AnimatePresence>
                {show && bonus > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-2xl shadow-[0_0_40px_rgba(249,115,22,0.5)] flex items-center gap-4"
                    >
                        <div className="bg-white/20 rounded-full p-2">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-black text-lg">🔥 {streak}-DAY STREAK!</div>
                            <div className="text-white/80 text-sm">+{bonus} bonus points added</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
