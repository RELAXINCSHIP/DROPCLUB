'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

export function ScratchCardGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isRevealed, setIsRevealed] = useState(false)
    const [pointsWon, setPointsWon] = useState(0)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [scratchPercentage, setScratchPercentage] = useState(0)

    // Initialize game
    useEffect(() => {
        setupCanvas()
        // Determine random prize (client-side simulation, secure verify on save)
        // In a real secure app, this would come from the server to prevent cheating.
        // For MVP, we'll randomize here and "claim" it.
        const potentialPoints = [10, 25, 50, 100]
        const randomWin = potentialPoints[Math.floor(Math.random() * potentialPoints.length)]
        setPointsWon(randomWin)
        setIsLoaded(true)
    }, [])

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

        // Fill properly
        ctx.fillStyle = '#C0C0C0' // Silver scratch color
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add "SCRATCH ME" text texture
        ctx.font = '30px Arial'
        ctx.fillStyle = '#A0A0A0'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2)

        // Add sparkle texture simulation
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#E0E0E0' : '#B0B0B0';
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2 + 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (isRevealed || isSaving) return

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
            x = e.nativeEvent.offsetX
            y = e.nativeEvent.offsetY
        }

        // Scratch effect (eraser)
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(x, y, 20, 0, Math.PI * 2)
        ctx.fill()

        checkRevealProgress()
    }

    const checkRevealProgress = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Check pixels every few scratches to avoid lag
        // Optimized: sample grid points instead of full getImageData
        // For accurate % we usually need getImageData but it's expensive.
        // We'll throttle or do it on mouse up? Let's do a simple check.
        // Actually for smooth UX, let's just use a counter or simpler heuristic?
        // Let's stick to ImageData on a throttle if possible, or just evaluate periodically.

        // Simplified approach: Just verify on mouse up or touch end?
        // Let's implement a visual feedback instead and rely on "Claim" button becoming active?
        // Or auto-win at 50%

        // Let's count pixels on the fly? No.
        // Let's just do it:
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let transparentPixels = 0
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] < 128) { // Alpha channel check
                transparentPixels++
            }
        }

        const percent = (transparentPixels / (pixels.length / 4)) * 100
        setScratchPercentage(percent)

        if (percent > 40 && !isRevealed) {
            revealPrize()
        }
    }

    const revealPrize = async () => {
        setIsRevealed(true)
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })

        // Save points to DB
        await savePoints()
    }

    const savePoints = async () => {
        setIsSaving(true)
        const supabase = createClient()

        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Optimistic update
        // In real app, call an edge function/RPC to add points securely
        // Here we just update the profile row for MVP

        // First get current points
        const { data: profile } = await supabase.from('profiles').select('points, lifetime_points').eq('id', user.id).single()

        if (profile) {
            const newPoints = (profile.points || 0) + pointsWon
            const newLifetime = (profile.lifetime_points || 0) + pointsWon

            const { error } = await supabase.from('profiles').update({
                points: newPoints,
                lifetime_points: newLifetime,
                last_played_at: new Date().toISOString()
            }).eq('id', user.id)

            if (error) {
                toast.error('Failed to save points')
            } else {
                toast.success(`Won ${pointsWon} Points!`)
            }
        }
        setIsSaving(false)
    }

    const handleReset = () => {
        setIsRevealed(false)
        setScratchPercentage(0)
        setIsLoaded(false)
        // Reset canvas
        setTimeout(() => {
            setupCanvas()
            const potentialPoints = [10, 25, 50, 100]
            const randomWin = potentialPoints[Math.floor(Math.random() * potentialPoints.length)]
            setPointsWon(randomWin)
            setIsLoaded(true)
        }, 100)
    }

    return (
        <div className="w-full max-w-lg mx-auto bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 text-center border-b border-white/5 bg-zinc-950">
                <h2 className="text-2xl font-black text-white italic tracking-tighter">LUCKY SCRATCHER</h2>
                <p className="text-zinc-500 text-sm">Scratch to reveal your daily bonus points</p>
            </div>

            <div className="relative h-[300px] bg-linear-to-br from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center">
                {/* Underlying Prize Layer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center animate-pulse">
                    <Trophy className="w-24 h-24 text-yellow-300 drop-shadow-xl mb-4" />
                    <h3 className="text-6xl font-black text-white drop-shadow-md">{pointsWon}</h3>
                    <p className="text-white font-bold text-xl uppercase tracking-widest">Points</p>
                </div>

                {/* Canvas Overlay */}
                <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 cursor-crosshair touch-none transition-opacity duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleMouseMove}
                // Add mouse down/up listeners to handle drawing state better if needed.
                // For now handled in move with buttons check implicitly or simplified.
                />
            </div>

            <div className="p-6 bg-zinc-950 flex flex-col items-center gap-4">
                {isRevealed ? (
                    <div className="w-full text-center space-y-4">
                        <div className="text-green-500 font-bold text-lg animate-bounce">
                            YOU WON!
                        </div>
                        <Button
                            onClick={handleReset}
                            className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
                            disabled={isSaving}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                            Play Again (Dev Mode)
                        </Button>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-2">
                            <div
                                className="bg-purple-500 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(scratchPercentage * 2.5, 100)}%` }} // Speed up bar for visual satisfaction
                            ></div>
                        </div>
                        <p className="text-center text-xs text-zinc-500 uppercase">Scratch progress</p>
                    </div>
                )}
            </div>
        </div>
    )
}
