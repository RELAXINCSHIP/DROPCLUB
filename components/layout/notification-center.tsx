'use client'

import { useEffect, useState } from 'react'
import { Bell, X, Check, Trophy, Zap, Flame, Users, Gift } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface Notification {
    id: number
    type: string
    title: string
    message: string
    read: boolean
    link?: string
    created_at: string
}

const TYPE_ICONS: Record<string, any> = {
    win: Trophy,
    drop_new: Zap,
    streak: Flame,
    referral: Users,
    achievement: Gift,
    system: Bell,
}

const TYPE_COLORS: Record<string, string> = {
    win: 'text-yellow-400',
    drop_new: 'text-purple-400',
    streak: 'text-orange-400',
    referral: 'text-blue-400',
    achievement: 'text-green-400',
    system: 'text-zinc-400',
}

export function NotificationCenter() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const supabase = createClient()

        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.read).length)
            }
        }

        fetchNotifications()

        // Real-time subscription
        const channel = supabase
            .channel('notifications_changes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
            }, (payload) => {
                const newNotif = payload.new as Notification
                setNotifications(prev => [newNotif, ...prev.slice(0, 19)])
                setUnreadCount(prev => prev + 1)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const markAllRead = async () => {
        const supabase = createClient()
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
        if (unreadIds.length === 0) return

        await supabase
            .from('notifications')
            .update({ read: true })
            .in('id', unreadIds)

        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    const timeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
        if (seconds < 60) return 'just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
        return `${Math.floor(seconds / 86400)}d`
    }

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-12 w-80 max-h-[70vh] z-50 rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                                <h3 className="font-bold text-white text-sm">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-xs text-purple-400 hover:text-purple-300 font-bold"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="overflow-y-auto max-h-[60vh]">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500">
                                        <Bell className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map(notif => {
                                        const Icon = TYPE_ICONS[notif.type] || Bell
                                        const color = TYPE_COLORS[notif.type] || 'text-zinc-400'
                                        const content = (
                                            <div
                                                key={notif.id}
                                                className={`flex items-start gap-3 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${!notif.read ? 'bg-purple-500/5' : ''}`}
                                            >
                                                <div className={`mt-0.5 ${color}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-white truncate">{notif.title}</span>
                                                        {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />}
                                                    </div>
                                                    <p className="text-xs text-zinc-400 mt-0.5">{notif.message}</p>
                                                </div>
                                                <span className="text-[10px] text-zinc-600 font-mono shrink-0">
                                                    {timeAgo(notif.created_at)}
                                                </span>
                                            </div>
                                        )
                                        return notif.link ? (
                                            <Link key={notif.id} href={notif.link} onClick={() => setOpen(false)}>
                                                {content}
                                            </Link>
                                        ) : (
                                            <div key={notif.id}>{content}</div>
                                        )
                                    })
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
