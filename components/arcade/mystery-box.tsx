'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'

const RARITY_COLORS: Record<string, string> = {
    common: 'text-zinc-300 border-zinc-500/30 bg-zinc-800/50',
    rare: 'text-blue-400 border-blue-500/30 bg-blue-900/20',
    epic: 'text-purple-400 border-purple-500/30 bg-purple-900/20',
    legendary: 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20 shadow-[0_0_30px_-5px_rgba(234,179,8,0.4)]',
}

const RARITY_GLOW: Record<string, string> = {
    common: '',
    rare: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]',
    epic: 'shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]',
    legendary: 'shadow-[0_0_40px_-5px_rgba(234,179,8,0.5)]',
}

interface MysteryBoxProps {
    userPoints: number
}

export function MysteryBox({ userPoints }: MysteryBoxProps) {
    const [isOpening, setIsOpening] = useState(false)
    const [reward, setReward] = useState<any>(null)
    const [phase, setPhase] = useState<'idle' | 'shaking' | 'opening' | 'revealed'>('idle')
    const router = useRouter()
    const COST = 100

    const canAfford = userPoints >= COST

    const openBox = async () => {
        if (!canAfford || isOpening) return
        setIsOpening(true)
        setPhase('shaking')

        try {
            const res = await fetch('/api/mystery-box', { method: 'POST' })
            const data = await res.json()

            if (!data.success) {
                toast.error(data.error || 'Failed to open box')
                setIsOpening(false)
                setPhase('idle')
                return
            }

            // Shaking phase
            await new Promise(r => setTimeout(r, 2000))
            setPhase('opening')

            // Opening phase
            await new Promise(r => setTimeout(r, 1500))
            setPhase('revealed')
            setReward(data.reward)

            // Confetti based on rarity
            const rarity = data.reward?.rarity || 'common'
            confetti({
                particleCount: rarity === 'legendary' ? 300 : rarity === 'epic' ? 200 : 100,
                spread: rarity === 'legendary' ? 120 : 70,
                origin: { y: 0.5 },
                colors: rarity === 'legendary'
                    ? ['#FFD700', '#FFA500', '#FF4500']
                    : rarity === 'epic'
                        ? ['#A855F7', '#7C3AED']
                        : undefined,
            })

            toast.success(`${data.reward?.icon} ${data.reward?.name}: +${data.reward?.reward_value} PTS!`)
            router.refresh()
        } catch (e) {
            console.error(e)
            toast.error('Something went wrong')
            setPhase('idle')
        } finally {
            setIsOpening(false)
        }
    }

    const reset = () => {
        setPhase('idle')
        setReward(null)
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-8 text-center">
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Mystery Box</h3>
            <p className="text-zinc-400 text-sm mb-8">Spend {COST} PTS for a random reward</p>

            {/* Box */}
            <div className="relative mx-auto w-40 h-40 mb-8">
                <motion.div
                    animate={
                        phase === 'shaking'
                            ? { rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.05, 1, 1.05, 1] }
                            : phase === 'opening'
                                ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
                                : {}
                    }
                    transition={
                        phase === 'shaking'
                            ? { repeat: Infinity, duration: 0.5 }
                            : { duration: 0.8 }
                    }
                    className="w-full h-full"
                >
                    {phase !== 'revealed' && (
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 border-2 border-purple-400/30 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)]">
                            <Package className="w-16 h-16 text-white/80" />
                        </div>
                    )}
                </motion.div>

                {/* Revealed reward */}
                <AnimatePresence>
                    {phase === 'revealed' && reward && (
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center ${RARITY_COLORS[reward.rarity]} ${RARITY_GLOW[reward.rarity]}`}
                        >
                            <div className="text-5xl mb-2">{reward.icon}</div>
                            <div className="font-black text-lg">{reward.name}</div>
                            <div className={`text-sm font-mono mt-1 ${reward.rarity === 'legendary' ? 'text-yellow-400' : 'text-zinc-300'}`}>
                                +{reward.reward_value} PTS
                            </div>
                            <div className="mt-1 text-[10px] uppercase tracking-widest opacity-60 font-bold">
                                {reward.rarity}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            {phase === 'revealed' ? (
                <Button
                    onClick={reset}
                    size="lg"
                    className="w-full max-w-xs mx-auto bg-white text-black hover:bg-zinc-200 font-bold text-lg h-14"
                >
                    OPEN ANOTHER
                </Button>
            ) : (
                <Button
                    onClick={openBox}
                    disabled={!canAfford || isOpening}
                    size="lg"
                    className={`w-full max-w-xs mx-auto font-black text-lg h-14 transition-all ${!canAfford
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        }`}
                >
                    {isOpening ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : !canAfford ? (
                        `NEED ${COST - userPoints} MORE PTS`
                    ) : (
                        <span className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" /> OPEN BOX ({COST} PTS)
                        </span>
                    )}
                </Button>
            )}
        </div>
    )
}
