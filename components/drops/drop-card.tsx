'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, Trophy, Loader2, Zap } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { enterDrop } from '@/app/actions'
import { Countdown } from './countdown'
import { createClient } from '@/utils/supabase/client'

interface DropCardProps {
    id: number
    title: string
    prize: string
    image: string
    endsAt: string // Changed from timeLeft string to endsAt date string
    entries: number
    isEntered?: boolean
}

export function DropCard({ id, title, prize, image, endsAt, entries: initialEntries, isEntered }: DropCardProps) {
    const [loading, setLoading] = useState(false)
    const [entryCount, setEntryCount] = useState(initialEntries)
    const [entered, setEntered] = useState(isEntered)

    // Real-time subscription for entry count
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel(`drop-${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'entries',
                    filter: `drop_id=eq.${id}`,
                },
                (payload) => {
                    setEntryCount((prev) => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id])


    const handleEnter = async () => {
        setLoading(true)
        try {
            const result = await enterDrop(id)
            if (result.error) {
                alert(result.error) // Simple alert for now
            } else {
                setEntered(true)
                // Optimistic update happens via realtime anyway, but good to have local state
            }
        } catch (e) {
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Card className="overflow-hidden border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.2)] group">
                <div className="aspect-video w-full bg-zinc-950 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                        {/* Placeholder for real image */}
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
                        <div className="flex items-end justify-between">
                            <Countdown targetDate={endsAt} />
                        </div>
                    </div>
                </div>
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
                                <span className="relative z-10 flex items-center gap-2">
                                    Enter Drop <Zap className={`w-4 h-4 ${!loading && 'fill-black'}`} />
                                </span>
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
