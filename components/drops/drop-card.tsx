'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Zap, Users, Trophy, Loader2, Play } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Countdown } from './countdown'
import { createClient } from '@/utils/supabase/client'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { enterDrop } from '@/app/actions'
import { DropComments } from './drop-comments'

interface DropCardProps {
    id: number
    title: string
    prize: string
    image: string
    endsAt: string
    entries: number
    entryCost: number
    winnerVideoUrl?: string | null
    isEntered?: boolean
}

export function DropCard({ id, title, prize, image, endsAt, entries: initialEntries, entryCost, winnerVideoUrl, isEntered }: DropCardProps) {
    const [loading, setLoading] = useState(false)
    const [entryCount, setEntryCount] = useState(initialEntries)
    const [entered, setEntered] = useState(isEntered)
    const [showVideo, setShowVideo] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const [tilt, setTilt] = useState({ x: 0, y: 0 })
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        setTilt({
            x: (y - 0.5) * -12,
            y: (x - 0.5) * 12,
        })
        setGlarePos({ x: x * 100, y: y * 100 })
    }, [])

    const handleMouseLeave = useCallback(() => {
        setTilt({ x: 0, y: 0 })
        setGlarePos({ x: 50, y: 50 })
    }, [])

    // ... (useEffect remains same) ...

    const handleEnter = async () => {
        setLoading(true)
        try {
            const result = await enterDrop(id)
            if (result.error) {
                alert(result.error) // Keeps simple for now
            } else {
                setEntered(true)
            }
        } catch (e) {
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
                transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.15s ease-out',
            }}
        >
            <Card className="overflow-hidden border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.2)] group relative">
                {/* Holographic glare overlay */}
                <div
                    className="pointer-events-none absolute inset-0 z-20 opacity-0 group-hover:opacity-30 transition-opacity duration-300 mix-blend-overlay"
                    style={{
                        background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-0 z-20 opacity-0 group-hover:opacity-20 transition-opacity duration-300 mix-blend-color-dodge"
                    style={{
                        background: `linear-gradient(${135 + tilt.y * 5}deg, #ff0000, #ff7700, #ffff00, #00ff00, #0099ff, #6633ff, #ff00ff)`,
                    }}
                />
                <div className="aspect-video w-full bg-zinc-950 relative overflow-hidden">
                    {/* ... (image and countdown remain same) ... */}
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                    {entered && (
                        <div className="absolute top-3 right-3 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-green-500/50 backdrop-blur-md flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            ENTERED
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-12">
                        {/* Display Cost Badge if not entered */}
                        {!entered && entryCost > 0 && (
                            <div className="absolute top-3 left-3 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-purple-500/50 backdrop-blur-md flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                                <Zap className="w-3 h-3 fill-purple-300" />
                                {entryCost} PTS
                            </div>
                        )}
                        <div className="flex items-end justify-between">
                            <Countdown targetDate={endsAt} />
                        </div>
                    </div>
                </div>

                {/* ... (Header and Content remain same) ... */}
                <CardHeader className="space-y-1 pb-3">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="font-bold text-xl leading-tight text-white group-hover:text-purple-300 transition-colors">{title}</h3>
                            <p className="text-zinc-400 text-sm mt-1">Win <span className="text-white font-medium">{prize}</span></p>
                        </div>
                        <div className="bg-yellow-500/10 p-2.5 rounded-xl ring-1 ring-yellow-500/20 group-hover:ring-yellow-500/50 group-hover:bg-yellow-500/20 transition-all">
                            <Trophy className="text-yellow-500 h-5 w-5" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="flex justify-between text-sm text-zinc-400">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <Users className="h-3.5 w-3.5 text-blue-400" />
                            <span className="font-mono text-zinc-200">{entryCount.toLocaleString()}</span> entries
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    {winnerVideoUrl ? (
                        <Dialog open={showVideo} onOpenChange={setShowVideo}>
                            <DialogTrigger asChild>
                                <Button className="w-full font-bold h-12 text-md bg-yellow-500 hover:bg-yellow-600 text-black transition-all">
                                    <Play className="mr-2 h-4 w-4 fill-black" />
                                    Watch Winner Reveal
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[800px] p-0 bg-black border-zinc-800 overflow-hidden">
                                <div className="aspect-video w-full">
                                    <iframe
                                        src={winnerVideoUrl.replace('watch?v=', 'embed/')}
                                        title="Winner Announcement"
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Button
                            className={`w-full font-bold h-12 text-md transition-all relative overflow-hidden ${entered ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]'}`}
                            disabled={entered || loading}
                            onClick={handleEnter}
                        >
                            {entered ? (
                                'You\'re In'
                            ) : (
                                <>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {!loading && (
                                        <span className="relative z-10 flex items-center gap-2">
                                            Enter {entryCost > 0 ? `(${entryCost} PTS)` : 'Free'} <Zap className={`w-4 h-4 ${!loading && 'fill-black'}`} />
                                        </span>
                                    )}
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>

                {/* Comments */}
                <div className="px-6 pb-4">
                    <DropComments dropId={id} />
                </div>
            </Card>
        </motion.div>
    )
}
