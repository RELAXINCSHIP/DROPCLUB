'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Trophy, Loader2, Users } from 'lucide-react'
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
            <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-sm group">
                <div className="aspect-video w-full bg-zinc-800 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                        {/* Placeholder for real image */}
                        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    {entered && (
                        <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs font-bold ring-1 ring-green-500/50 backdrop-blur-md">
                            ENTERED
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <Countdown targetDate={endsAt} />
                    </div>
                </div>
                <CardHeader className="space-y-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{title}</h3>
                            <p className="text-zinc-400 text-sm">Win {prize}</p>
                        </div>
                        <div className="bg-yellow-500/10 p-2 rounded-full ring-1 ring-yellow-500/20">
                            <Trophy className="text-yellow-500 h-5 w-5" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between text-sm text-zinc-400">
                        <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-full">
                            <Users className="h-4 w-4 text-blue-400" />
                            <span className="font-mono text-zinc-200">{entryCount.toLocaleString()}</span> entries
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className={`w-full font-bold transition-all ${entered ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'}`}
                        disabled={entered || loading}
                        onClick={handleEnter}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {entered ? 'You\'re In' : 'Enter Now'}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
