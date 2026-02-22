'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Zap } from 'lucide-react'

interface FeedItem {
    id: number
    event_type: string
    description: string
    username: string
    created_at: string
}

const EVENT_ICONS: Record<string, string> = {
    entry: '🎯',
    win: '🏆',
    jackpot: '🎰',
    signup: '👋',
    achievement: '🎖️',
    purchase: '💰',
    mystery_box: '📦',
}

export function ActivityFeed() {
    const [items, setItems] = useState<FeedItem[]>([])
    const [visible, setVisible] = useState<FeedItem[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const supabase = createClient()

        // Fetch initial feed
        const fetchFeed = async () => {
            const { data } = await supabase
                .from('activity_feed')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(30)

            if (data && data.length > 0) {
                setItems(data)
                setVisible(data.slice(0, 5))
            }
        }

        fetchFeed()

        // Subscribe to real-time inserts
        const channel = supabase
            .channel('activity_feed_changes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'activity_feed',
            }, (payload) => {
                const newItem = payload.new as FeedItem
                setItems(prev => [newItem, ...prev.slice(0, 29)])
                setVisible(prev => [newItem, ...prev.slice(0, 4)])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Rotating ticker for when there's enough items
    useEffect(() => {
        if (items.length <= 5) return

        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const next = (prev + 1) % items.length
                setVisible(items.slice(next, next + 5).length >= 5
                    ? items.slice(next, next + 5)
                    : [...items.slice(next), ...items.slice(0, 5 - (items.length - next))]
                )
                return next
            })
        }, 4000)

        return () => clearInterval(interval)
    }, [items])

    const timeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
        if (seconds < 60) return 'just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        return `${Math.floor(seconds / 86400)}d ago`
    }

    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Live Feed</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <p className="text-zinc-600 text-sm text-center py-4">No activity yet. Be the first!</p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Live Feed</h3>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {visible.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: 20, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                        >
                            <span className="text-lg flex-shrink-0">
                                {EVENT_ICONS[item.event_type] || '⚡'}
                            </span>
                            <span className="text-sm text-zinc-300 flex-1 truncate">
                                <span className="font-bold text-white">{item.username || 'Someone'}</span>{' '}
                                {item.description}
                            </span>
                            <span className="text-[10px] text-zinc-600 font-mono flex-shrink-0">
                                {timeAgo(item.created_at)}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
