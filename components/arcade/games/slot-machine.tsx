'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { playArcadeGame } from '@/app/actions/arcade'
import Link from 'next/link'
import { useSoundFX } from '@/hooks/use-sound-fx'
import { useRouter } from 'next/navigation'

const ALL_SYMBOLS = ['🍒', '🍋', '🔔', '💎', '7️⃣', '🍀']

interface SlotMachineGameProps {
    initialPoints: number
}

export function SlotMachineGame({ initialPoints }: SlotMachineGameProps) {
    const [isSpinning, setIsSpinning] = useState(false)
    const [reels, setReels] = useState(['❓', '❓', '❓'])
    const [result, setResult] = useState<{ won: boolean; points: number; jackpot: boolean } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentPoints, setCurrentPoints] = useState(initialPoints)
    const [spinningReels, setSpinningReels] = useState([false, false, false])
    const router = useRouter()
    const { play } = useSoundFX()
    const intervalRefs = useRef<NodeJS.Timeout[]>([])

    // Cleanup
    useEffect(() => {
        return () => intervalRefs.current.forEach(clearInterval)
    }, [])

    const spin = async () => {
        if (isSpinning) return
        setIsSpinning(true)
        setResult(null)
        setError(null)

        // Start spinning animation - each reel cycles through random symbols
        setSpinningReels([true, true, true])
        const tempReels = ['❓', '❓', '❓']

        intervalRefs.current.forEach(clearInterval)
        intervalRefs.current = []

        for (let i = 0; i < 3; i++) {
            const interval = setInterval(() => {
                tempReels[i] = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]
                setReels([...tempReels])
            }, 80)
            intervalRefs.current.push(interval)
        }

        try {
            const res = await playArcadeGame('slots')

            if (!res.success) {
                intervalRefs.current.forEach(clearInterval)
                setSpinningReels([false, false, false])
                setError(res.error || 'Failed to spin')
                setIsSpinning(false)
                return
            }

            const finalReels = res.prize?.reels || ['🍒', '🍋', '🔔']
            const isJackpot = res.prize?.jackpot || false
            const pts = res.pointsWon || 0

            // Stop reels one at a time with delay
            for (let i = 0; i < 3; i++) {
                await new Promise(r => setTimeout(r, 600 + i * 400))
                clearInterval(intervalRefs.current[i])
                tempReels[i] = finalReels[i]
                setReels([...tempReels])
                setSpinningReels(prev => {
                    const next = [...prev]
                    next[i] = false
                    return next
                })
                play('tick')
            }

            // Show result
            await new Promise(r => setTimeout(r, 300))
            setResult({ won: pts > 0, points: pts, jackpot: isJackpot })
            setIsSpinning(false)

            if (pts > 0) {
                play('win')
                setCurrentPoints(prev => prev + pts)
                confetti({
                    particleCount: isJackpot ? 300 : 100,
                    spread: isJackpot ? 120 : 70,
                    origin: { y: 0.6 },
                    colors: isJackpot ? ['#FFD700', '#FFA500', '#FF4500'] : undefined
                })
                toast.success(isJackpot ? `JACKPOT! +${pts} PTS!` : `+${pts} PTS!`)
            } else {
                play('pop')
                toast('No match. Try again!')
            }

            router.refresh()
        } catch (e) {
            console.error(e)
            intervalRefs.current.forEach(clearInterval)
            setSpinningReels([false, false, false])
            setError('Something went wrong')
            setIsSpinning(false)
        }
    }

    if (error) {
        return (
            <div className="w-full max-w-lg mx-auto bg-zinc-900 border border-red-500/30 rounded-3xl p-8 text-center mt-12">
                <h2 className="text-xl font-bold text-red-400 mb-2">Daily Limit Reached</h2>
                <p className="text-zinc-400 mb-6">{error}</p>
                <Link href="/dashboard/arcade">
                    <Button variant="outline">Come Back Tomorrow</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            {/* Points Display */}
            <div className="mb-8 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-400 font-mono font-bold text-sm">{currentPoints.toLocaleString()} PTS</span>
            </div>

            {/* Slot Machine */}
            <div className="relative mt-8 mb-12">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-3xl scale-150" />

                {/* Machine Frame */}
                <div className="relative bg-zinc-900 border-2 border-zinc-700 rounded-3xl p-8 shadow-[0_0_60px_-10px_rgba(239,68,68,0.3)]">
                    {/* Top Bar */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-1 rounded-full font-black text-sm tracking-widest shadow-lg">
                        SLOTS
                    </div>

                    {/* Reels */}
                    <div className="flex gap-3">
                        {reels.map((symbol, i) => (
                            <div
                                key={i}
                                className={`w-24 h-28 md:w-28 md:h-32 rounded-2xl bg-black border-2 flex items-center justify-center text-5xl md:text-6xl transition-all duration-200 ${spinningReels[i]
                                        ? 'border-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]'
                                        : result?.won && result.points > 0
                                            ? 'border-yellow-500/50 shadow-[inset_0_0_20px_rgba(234,179,8,0.2)]'
                                            : 'border-zinc-700'
                                    }`}
                            >
                                <motion.div
                                    animate={spinningReels[i] ? { y: [0, -10, 0] } : {}}
                                    transition={{ repeat: Infinity, duration: 0.15 }}
                                >
                                    {symbol}
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    {/* Win Line */}
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-red-500/30 pointer-events-none" />
                </div>
            </div>

            {/* Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center mb-6"
                    >
                        {result.jackpot ? (
                            <div className="text-5xl font-black text-yellow-400 animate-pulse drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                                🎰 JACKPOT! +{result.points} PTS 🎰
                            </div>
                        ) : result.won ? (
                            <div className="text-4xl font-black text-yellow-400">+{result.points} PTS</div>
                        ) : (
                            <div className="text-2xl font-black text-zinc-500">NO MATCH</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex flex-col gap-4 w-full max-w-xs">
                {result ? (
                    <Link href="/dashboard/arcade">
                        <Button size="lg" className="w-full bg-white text-black hover:bg-zinc-200 font-bold text-xl h-14">
                            CONTINUE
                        </Button>
                    </Link>
                ) : (
                    <Button
                        onClick={spin}
                        disabled={isSpinning}
                        size="lg"
                        className={`w-full font-black text-xl h-16 transition-all transform hover:scale-105 active:scale-95 ${isSpinning
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-linear-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] border-t border-white/20'
                            }`}
                    >
                        {isSpinning ? (
                            <span className="flex items-center">
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> SPINNING...
                            </span>
                        ) : (
                            'PULL THE LEVER!'
                        )}
                    </Button>
                )}

                <p className="text-zinc-500 text-xs text-center font-mono">
                    MATCH 2 = 15 PTS • MATCH 3 = 75+ PTS • 7-7-7 = 500 PTS
                </p>
            </div>
        </div>
    )
}
