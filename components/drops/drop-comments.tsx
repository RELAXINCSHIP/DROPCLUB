'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Send, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface DropCommentsProps {
    dropId: number
}

interface Comment {
    id: number
    username: string
    content: string
    created_at: string
}

export function DropComments({ dropId }: DropCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const supabase = createClient()

        const fetchComments = async () => {
            const { data } = await supabase
                .from('drop_comments')
                .select('*')
                .eq('drop_id', dropId)
                .order('created_at', { ascending: true })
                .limit(50)

            if (data) setComments(data)
        }

        fetchComments()

        // Real-time
        const channel = supabase
            .channel(`comments_${dropId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'drop_comments',
                filter: `drop_id=eq.${dropId}`,
            }, (payload) => {
                setComments(prev => [...prev, payload.new as Comment])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [dropId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [comments])

    const submitComment = async () => {
        if (!newComment.trim() || loading) return
        setLoading(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('Please log in to comment')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, email')
                .eq('id', user.id)
                .single()

            const username = profile?.display_name || profile?.email?.split('@')[0] || 'Anon'

            await supabase.from('drop_comments').insert({
                drop_id: dropId,
                user_id: user.id,
                username,
                content: newComment.trim(),
            })

            setNewComment('')
        } catch (e) {
            toast.error('Failed to post comment')
        } finally {
            setLoading(false)
        }
    }

    const timeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
        if (seconds < 60) return 'now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
        return `${Math.floor(seconds / 86400)}d`
    }

    return (
        <div className="mt-3">
            <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-bold"
            >
                💬 {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {/* Comments list */}
                        <div
                            ref={scrollRef}
                            className="mt-2 max-h-40 overflow-y-auto space-y-2 pr-1"
                        >
                            {comments.length === 0 ? (
                                <p className="text-xs text-zinc-600 py-2">No comments yet. Be first!</p>
                            ) : (
                                comments.map(c => (
                                    <div key={c.id} className="flex gap-2 text-xs">
                                        <span className="font-bold text-purple-400 shrink-0">{c.username}</span>
                                        <span className="text-zinc-300 break-words">{c.content}</span>
                                        <span className="text-zinc-600 shrink-0 font-mono">{timeAgo(c.created_at)}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input */}
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submitComment()}
                                placeholder="Say something..."
                                maxLength={200}
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                            />
                            <button
                                onClick={submitComment}
                                disabled={!newComment.trim() || loading}
                                className="text-purple-400 hover:text-purple-300 disabled:text-zinc-600 p-1.5"
                            >
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
