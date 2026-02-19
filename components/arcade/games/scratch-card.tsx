'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, RefreshCw, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { playArcadeGame } from '@/app/actions/arcade'
import Link from 'next/link'
import { useSoundFX } from '@/hooks/use-sound-fx'

import { useRouter } from 'next/navigation'

interface ScratchCardGameProps {
    initialPoints: number
}

export function ScratchCardGame({ initialPoints }: ScratchCardGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isRevealed, setIsRevealed] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [scratchPercentage, setScratchPercentage] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [currentPoints, setCurrentPoints] = useState(initialPoints)
    const router = useRouter()

    // Sound FX
    const { play } = useSoundFX()

    // Initialize game
    useEffect(() => {
        initializeGame()
    }, [])

    const initializeGame = async () => {
        setLoading(true)
        try {
            const gameResult = await playArcadeGame('scratch')

            if (!gameResult.success) {
                setError(gameResult.error || 'Failed to start game')
                setLoading(false)
                return
            }

            setResult(gameResult)
            setupCanvas()
            setLoading(false)
        } catch (e) {
            setError("Something went wrong")
            setLoading(false)
        }
    }

    const setupCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set dimensions (responsive)
        const parent = canvas.parentElement
        if (parent) {
            canvas.width = parent.offsetWidth
            canvas.height = 300 // fixed height
        }

        // Fill with Holographic Foil Effect
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#C0C0C0') // Silver
        gradient.addColorStop(0.2, '#E0E0E0') // Light Silver
        gradient.addColorStop(0.4, '#A0A0A0') // Dark Silver
        gradient.addColorStop(0.6, '#D0D0D0') // Silver
        gradient.addColorStop(0.8, '#909090') // Darker
        gradient.addColorStop(1, '#C0C0C0') // Silver

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add Noise/Glitter
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#808080';
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add "SCRATCH ME" text texture
        ctx.font = '900 40px "Inter", sans-serif'
        ctx.fillStyle = 'rgba(0,0,0,0.1)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('DROPCLUB', canvas.width / 2, canvas.height / 2 - 20)

        ctx.font = '20px "Inter", sans-serif'
        ctx.fillStyle = 'rgba(0,0,0,0.2)'
        ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2 + 30)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (isRevealed || loading || error) return

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        let x, y

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left
            y = e.touches[0].clientY - rect.top
        } else {
            // Check if mouse is down for mouse events
            if (e.type === 'mousemove' && (e.buttons !== 1)) return
            x = e.nativeEvent.offsetX
            y = e.nativeEvent.offsetY
        }

        // Play scratch sound (throttled randomly to not be annoying)
        if (Math.random() > 0.8) {
            play('scratch')
        }

        // Scratch effect (eraser)
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(x, y, 25, 0, Math.PI * 2)
        ctx.fill()

        checkRevealProgress()
    }

    const checkRevealProgress = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Optimized sampling
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let transparentPixels = 0
        // Check every 16th pixel for performance
        for (let i = 0; i < pixels.length; i += 64) {
            if (pixels[i + 3] < 128) {
                transparentPixels++
            }
        }

        const totalSampled = pixels.length / 64
        const percent = (transparentPixels / totalSampled) * 100
        setScratchPercentage(percent)

        if (percent > 40 && !isRevealed) {
            revealPrize()
        }
    }

    const revealPrize = () => {
        setIsRevealed(true)
        play('win')

        if (result?.newTotal) {
            setCurrentPoints(result.newTotal)
        }

        // Refresh server stats
        router.refresh()

        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FFFFFF']
        })
        toast.success(`You revealed ${result.pointsWon} Points!`)
    }

    if (error) {
        return (
            <div className="w-full max-w-lg mx-auto bg-zinc-900 border border-red-500/30 rounded-3xl p-8 text-center">
                <h2 className="text-xl font-bold text-red-400 mb-2">Daily Limit Reached</h2>
                <p className="text-zinc-400 mb-6">{error}</p>
                <Link href="/dashboard">
                    <Button variant="outline">Come Back Tomorrow</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full max-w-lg mx-auto bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
            {/* Holographic Border Effect */}
            <div className="absolute -inset-px bg-linear-to-r from-purple-500 via-pink-500 to-yellow-500 opacity-30 rounded-3xl z-0 pointer-events-none" />

            {/* Balance Display */}
            <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-yellow-500/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-yellow-400 font-mono font-bold">{currentPoints.toLocaleString()} PTS</span>
            </div>

            <div className="relative z-10">
                <div className="p-6 text-center border-b border-white/5 bg-black/50 backdrop-blur-sm">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" /> LUCKY SCRATCHER
                    </h2>
                    <p className="text-zinc-500 text-sm">Scratch to reveal your daily bonus</p>
                </div>

                <div className="relative h-[300px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-purple-900 via-zinc-950 to-zinc-950" />

                    {/* Underlying Prize Layer */}
                    {!loading && result && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="flex flex-col items-center"
                            >
                                <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] mb-4" />
                                <h3 className="text-7xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-zinc-400 drop-shadow-sm">{result.pointsWon}</h3>
                                <p className="text-yellow-500 font-bold text-xl uppercase tracking-widest mt-2">Points Won</p>
                            </motion.div>
                        </div>
                    )}

                    {/* Canvas Overlay */}
                    <canvas
                        ref={canvasRef}
                        className={`absolute inset-0 cursor-crosshair touch-none transition-all duration-700 ${isRevealed ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleMouseMove}
                        onMouseDown={handleMouseMove} // Start scratching on click
                    />

                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-20">
                            <RefreshCw className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                </div>

                <div className="p-6 bg-black/50 backdrop-blur-sm flex flex-col items-center gap-4 border-t border-white/5">
                    {isRevealed ? (
                        <div className="w-full text-center space-y-4 animate-in slide-in-from-bottom-4">
                            <div className="text-green-400 font-bold text-lg">
                                CREDITED TO YOUR ACCOUNT
                            </div>
                            <Link href="/dashboard/arcade">
                                <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold">
                                    Continue
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="flex justify-between text-xs text-zinc-500 mb-1 uppercase font-bold">
                                <span>Reveal Progress</span>
                                <span>{Math.round(scratchPercentage)}%</span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                <div
                                    className="bg-linear-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-100 ease-out"
                                    style={{ width: `${Math.min(scratchPercentage * 2.5, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
