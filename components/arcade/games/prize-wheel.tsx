'use client'

import { useState } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import { Trophy, RefreshCw, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { playArcadeGame } from '@/app/actions/arcade'
import Link from 'next/link'
import { useSoundFX } from '@/hooks/use-sound-fx'

const PRIZES = [
    { label: '10', color: '#a855f7', value: 10 },
    { label: '50', color: '#ec4899', value: 50 },
    { label: '100', color: '#eab308', value: 100 },
    { label: '25', color: '#3b82f6', value: 25 },
    { label: '10', color: '#a855f7', value: 10 },
    { label: 'JACKPOT', color: '#f59e0b', value: 500, special: true },
    { label: '25', color: '#3b82f6', value: 25 },
    { label: '50', color: '#ec4899', value: 50 },
]

import { useRouter } from 'next/navigation'

interface PrizeWheelGameProps {
    initialPoints: number
}

export function PrizeWheelGame({ initialPoints }: PrizeWheelGameProps) {
    const [isSpinning, setIsSpinning] = useState(false)
    const [winResult, setWinResult] = useState<{ label: string, value: number, color: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentPoints, setCurrentPoints] = useState(initialPoints)
    const controls = useAnimation()
    const router = useRouter()

    // Sound FX
    const { play } = useSoundFX()

    // Config
    const segmentAngle = 360 / PRIZES.length

    const spin = async () => {
        if (isSpinning) return
        setIsSpinning(true)
        setWinResult(null)
        setError(null)

        try {
            // 1. Get Result from Server
            const result = await playArcadeGame('wheel')

            if (!result.success) {
                setError(result.error || "Failed to spin")
                setIsSpinning(false)
                return
            }

            const prize = result.prize
            // Find index of prize
            // Note: In real app, ensure PRIZES array matches server exactly.
            // Here we assume secure sync.
            // visual index might need mapping if server returns just value.
            // Server returns the full prize object from its array.
            const prizeIndex = PRIZES.findIndex(p => p.label === prize.label && p.value === prize.value)

            if (prizeIndex === -1) {
                throw new Error("Prize mismatch")
            }

            // 2. Animate
            const fullSpins = 360 * 5
            // Target: Index 0 is at top?
            // If we rotate to (360 - index * angle), that segment is at top.
            const targetRotation = fullSpins + (360 - (prizeIndex * segmentAngle))

            await controls.start({
                rotate: targetRotation,
                transition: {
                    duration: 4,
                    ease: [0.2, 0.8, 0.2, 1],
                }
            })

            // 3. Win
            handleWin(prize, result.pointsWon || 0)

        } catch (e) {
            console.error(e)
            setError("Something went wrong")
            setIsSpinning(false)
        }
    }

    // Effect for ticking sound during spin?
    // Hard to sync exactly with framer motion without custom frame loop.
    // CSS/Framer doesn't emit "tick" events easily.
    // Simplification: Play a ratchet sound at start or just `play('tick')` on specific timeouts?
    // Let's rely on the visual "Doper" feel for now, sound on win.

    const handleWin = (prize: typeof PRIZES[0], points: number) => {
        setWinResult(prize)
        setIsSpinning(false)
        play('win')

        if (points > 0) {
            setCurrentPoints(prev => prev + points)
        }

        // Refresh server stats
        router.refresh()

        if (points > 0) {
            confetti({
                particleCount: prize.special ? 200 : 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: prize.special ? ['#FFD700', '#FFA500'] : undefined
            })
            toast.success(`You won ${prize.label} Points!`)
        }
    }

    const handleReset = () => {
        setWinResult(null)
        controls.set({ rotate: 0 })
    }

    if (error) {
        return (
            <div className="w-full max-w-lg mx-auto bg-zinc-900 border border-red-500/30 rounded-3xl p-8 text-center mt-12">
                <h2 className="text-xl font-bold text-red-400 mb-2">Daily Limit Reached</h2>
                <p className="text-zinc-400 mb-6">{error}</p>
                <Link href="/dashboard">
                    <Button variant="outline">Come Back Tomorrow</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">

            <div className="relative mb-8 mt-12 group">
                {/* Pointer (Ticker) */}
                <div className={`absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-white drop-shadow-lg transition-transform duration-100 ${isSpinning ? 'animate-bounce' : ''}`}>
                    <ArrowDown className="w-12 h-12 fill-red-500 stroke-black stroke-2" />
                </div>

                {/* Outer Glow */}
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />

                {/* Wheel Container */}
                <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full border-8 border-zinc-800 shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)] overflow-hidden bg-zinc-900 ring-4 ring-white/5">

                    {/* Balance Display Overlay */}
                    <div className="absolute top-4 right-1/2 translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-2 pointer-events-none">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-purple-400 font-mono font-bold text-xs">{currentPoints.toLocaleString()} PTS</span>
                    </div>

                    <motion.div
                        animate={controls}
                        className="w-full h-full rounded-full relative"
                        style={{ transformOrigin: 'center center' }}
                    >
                        {PRIZES.map((prize, i) => (
                            <div
                                key={i}
                                className="absolute top-0 left-1/2 w-[50%] h-[50%] origin-bottom-left flex justify-center pt-8"
                                style={{
                                    transform: `rotate(${i * segmentAngle}deg) skewY(-${90 - segmentAngle}deg)`,
                                    background: `linear-gradient(to bottom, ${prize.color}, ${adjustColor(prize.color, -30)})`,
                                    borderLeft: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <div
                                    className="text-white font-black text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
                                    style={{
                                        transform: `skewY(${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg) translate(20px, 40px)`,
                                    }}
                                >
                                    {prize.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Center Hub */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-zinc-900 rounded-full border-4 border-zinc-700 shadow-2xl flex items-center justify-center z-10">
                        <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full animate-pulse flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                            <Trophy className="w-6 h-6 text-white/90" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
                {winResult ? (
                    <div className="text-center animate-in slide-in-from-bottom-4 space-y-4">
                        <div className="text-4xl font-black text-yellow-400 drop-shadow-[0_2px_10px_rgba(250,204,21,0.5)]">
                            {winResult.value > 0 ? `+${winResult.value} PTS` : 'JACKPOT!'}
                        </div>
                        {winResult.special && (
                            <div className="text-yellow-500 font-bold animate-pulse">
                                YOU WON THE JACKPOT!
                            </div>
                        )}
                        <Link href="/dashboard/arcade">
                            <Button
                                size="lg"
                                className="w-full bg-white text-black hover:bg-zinc-200 font-bold text-xl h-14"
                            >
                                CONTINUE
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <Button
                        onClick={spin}
                        disabled={isSpinning}
                        size="lg"
                        className={`w-full font-black text-xl h-16 transition-all transform hover:scale-105 active:scale-95 ${isSpinning
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] border-t border-white/20'
                            }`}
                    >
                        {isSpinning ? (
                            <span className="flex items-center">
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> SPINNING...
                            </span>
                        ) : (
                            'SPIN TO WIN!'
                        )}
                    </Button>
                )}

                <p className="text-zinc-500 text-xs text-center font-mono">
                    PROVABLY FAIR • SECURE
                </p>
            </div>
        </div>
    )
}

function adjustColor(color: string, amount: number) {
    return color // Placeholder for color manipulation if needed, or just use css gradients above
}
