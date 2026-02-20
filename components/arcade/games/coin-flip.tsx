'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { playArcadeGame } from '@/app/actions/arcade'
import Link from 'next/link'
import { useSoundFX } from '@/hooks/use-sound-fx'
import { useRouter } from 'next/navigation'

interface CoinFlipGameProps {
    initialPoints: number
}

export function CoinFlipGame({ initialPoints }: CoinFlipGameProps) {
    const [isFlipping, setIsFlipping] = useState(false)
    const [result, setResult] = useState<{ won: boolean; landed: string; points: number } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentPoints, setCurrentPoints] = useState(initialPoints)
    const [flipRotation, setFlipRotation] = useState(0)
    const router = useRouter()
    const { play } = useSoundFX()

    const flip = async () => {
        if (isFlipping) return
        setIsFlipping(true)
        setResult(null)
        setError(null)

        try {
            const res = await playArcadeGame('coinflip')

            if (!res.success) {
                setError(res.error || 'Failed to flip')
                setIsFlipping(false)
                return
            }

            // Animate the coin
            const newRotation = flipRotation + 1800 + (res.prize?.playerWins ? 0 : 180)
            setFlipRotation(newRotation)

            // Wait for animation
            await new Promise(r => setTimeout(r, 2000))

            const won = res.prize?.playerWins || false
            const pts = res.pointsWon || 0
            setResult({ won, landed: res.prize?.landed || 'heads', points: pts })
            setIsFlipping(false)

            if (won && pts > 0) {
                play('win')
                setCurrentPoints(prev => prev + pts)
                confetti({
                    particleCount: pts >= 100 ? 200 : 80,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: pts >= 100 ? ['#FFD700', '#FFA500'] : undefined
                })
                toast.success(`+${pts} PTS!`)
            } else {
                play('pop')
                toast('Better luck next time!')
            }

            router.refresh()
        } catch (e) {
            console.error(e)
            setError('Something went wrong')
            setIsFlipping(false)
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
            <div className="mb-8 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-500/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-mono font-bold text-sm">{currentPoints.toLocaleString()} PTS</span>
            </div>

            {/* Coin */}
            <div className="relative mb-12 mt-8">
                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full scale-150" />
                <motion.div
                    className="relative w-48 h-48 md:w-56 md:h-56"
                    animate={{ rotateY: flipRotation }}
                    transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                >
                    {/* Heads */}
                    <div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.4)] border-4 border-yellow-300/50"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="text-center">
                            <div className="text-6xl font-black text-yellow-900/80">H</div>
                            <div className="text-sm font-bold text-yellow-900/60 tracking-wider">HEADS</div>
                        </div>
                    </div>
                    {/* Tails */}
                    <div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] border-4 border-orange-300/50"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className="text-center">
                            <div className="text-6xl font-black text-orange-900/80">T</div>
                            <div className="text-sm font-bold text-orange-900/60 tracking-wider">TAILS</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-6"
                    >
                        <div className={`text-4xl font-black mb-2 ${result.won ? 'text-yellow-400' : 'text-zinc-500'}`}>
                            {result.won ? `+${result.points} PTS!` : 'NO LUCK'}
                        </div>
                        <div className="text-zinc-400 text-sm uppercase tracking-wider">
                            Landed on {result.landed}
                            {result.landed === 'edge' && ' — LEGENDARY!'}
                        </div>
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
                        onClick={flip}
                        disabled={isFlipping}
                        size="lg"
                        className={`w-full font-black text-xl h-16 transition-all transform hover:scale-105 active:scale-95 ${isFlipping
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-linear-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black shadow-[0_0_30px_rgba(234,179,8,0.5)] border-t border-white/20'
                            }`}
                    >
                        {isFlipping ? (
                            <span className="flex items-center">
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> FLIPPING...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Coins className="w-5 h-5" /> FLIP THE COIN
                            </span>
                        )}
                    </Button>
                )}

                <p className="text-zinc-500 text-xs text-center font-mono">
                    50/50 ODDS • LAND ON EDGE FOR 100 PTS
                </p>
            </div>
        </div>
    )
}
