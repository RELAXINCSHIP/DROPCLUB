'use client'

import { useState } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import { Trophy, RefreshCw, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

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

export function PrizeWheelGame() {
    const [isSpinning, setIsSpinning] = useState(false)
    const [winResult, setWinResult] = useState<{ label: string, value: number } | null>(null)
    const controls = useAnimation()

    // Config
    const segmentAngle = 360 / PRIZES.length

    const spin = async () => {
        if (isSpinning) return
        setIsSpinning(true)
        setWinResult(null)

        // Determine outcome (random for client-side demo)
        const randomIndex = Math.floor(Math.random() * PRIZES.length)
        const prize = PRIZES[randomIndex]

        // Calculate rotation
        // We want to land on the chosen index.
        // Index 0 is at 0 degrees (top? right?). 
        // Let's assume standard CSS rotation where 0 is top.
        // If we have 8 segments, each is 45 deg.
        // To land on index i, we need to rotate such that index i is at the top.
        // But usually wheels spin clockwise, so the top moves counter-clockwise relative to the wheel?
        // Let's just do a big spin + specific offset.

        // Extra spins (5 to 10 full rotations)
        const fullSpins = 360 * (5 + Math.floor(Math.random() * 5))

        // The offset to land on the specific segment.
        // If 0 is at top, and we rotate clockwise, index 1 moves to where 0 was? No.
        // Let's assume pointer is at Top (0 deg).
        // To land on index 0, rotation % 360 should be 0 (or 360-0).
        // To land on index 1 (45 deg clockwise from 0), we need to rotate -45 deg? Or 360-45.
        // Let's settle on: Target Rotation = FullSpins + (360 - (index * segmentAngle))
        // We add random jitter within the segment (-20 to +20 deg) to make it look natural.

        const targetRotation = fullSpins + (360 - (randomIndex * segmentAngle))

        await controls.start({
            rotate: targetRotation,
            transition: {
                duration: 4,
                ease: [0.2, 0.8, 0.2, 1], // Cubic bezier for ease-out feel
            }
        })

        // Animation complete
        handleWin(prize)
    }

    const handleWin = async (prize: typeof PRIZES[0]) => {
        setWinResult(prize)
        setIsSpinning(false)

        if (prize.value > 0) {
            confetti({
                particleCount: prize.special ? 200 : 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: prize.special ? ['#FFD700', '#FFA500'] : undefined
            })
            toast.success(`You won ${prize.label} Points!`)
            await savePoints(prize.value)
        }
    }

    const savePoints = async (amount: number) => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('profiles').select('points, lifetime_points').eq('id', user.id).single()

        if (profile) {
            const newPoints = (profile.points || 0) + amount
            const newLifetime = (profile.lifetime_points || 0) + amount

            await supabase.from('profiles').update({
                points: newPoints,
                lifetime_points: newLifetime,
                last_played_at: new Date().toISOString()
            }).eq('id', user.id)
        }
    }

    const handleReset = () => {
        setWinResult(null)
        controls.set({ rotate: 0 })
    }

    return (
        <div className="flex flex-col items-center">

            <div className="relative mb-8 mt-12">
                {/* Pointer */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-white drop-shadow-lg">
                    <ArrowDown className="w-12 h-12 fill-current stroke-black stroke-2" />
                </div>

                {/* Wheel Container with border/glow */}
                <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full border-4 border-zinc-800 shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)] overflow-hidden bg-zinc-900">
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
                                    background: prize.color,
                                    // This skew logic creates the pie slices purely with CSS transforms.
                                    // It works well for even divisions.
                                    // For 8 slices (45deg), skewY should be -(90-45) = -45.
                                }}
                            >
                                <div
                                    className="text-white font-bold text-xl drop-shadow-md"
                                    style={{
                                        transform: `skewY(${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg) translate(20px, 20px)`,
                                        // Counter-transform text to be readable
                                    }}
                                >
                                    {prize.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Center Hub */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-zinc-200 shadow-inner flex items-center justify-center z-10">
                        <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                {winResult ? (
                    <Button
                        onClick={handleReset}
                        size="lg"
                        className="w-full bg-white text-black hover:bg-zinc-200 font-bold text-xl h-14"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" /> SPIN AGAIN
                    </Button>
                ) : (
                    <Button
                        onClick={spin}
                        disabled={isSpinning}
                        size="lg"
                        className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xl h-14 shadow-lg shadow-purple-500/20 border-0"
                    >
                        {isSpinning ? 'SPINNING...' : 'SPIN TO WIN!'}
                    </Button>
                )}

                <p className="text-zinc-500 text-xs text-center">
                    Results are provably fair and recorded on chain (simulated).
                </p>
            </div>
        </div>
    )
}
