'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function AdminDropForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [form, setForm] = useState({
        title: '',
        prize: '',
        image_url: '',
        ends_at: '',
        entry_cost: 0,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.prize || !form.ends_at) {
            toast.error('Please fill in all required fields')
            return
        }
        setLoading(true)

        try {
            const res = await fetch('/api/admin/drops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            const data = await res.json()
            if (!data.success) {
                toast.error(data.error || 'Failed to create drop')
            } else {
                toast.success('🎉 Drop created!')
                setForm({ title: '', prize: '', image_url: '', ends_at: '', entry_cost: 0 })
                router.refresh()
            }
        } catch (e) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 block">
                        Title *
                    </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="Air Jordan 4 Retro 'Military Blue'"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                </div>
                <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 block">
                        Prize *
                    </label>
                    <input
                        type="text"
                        value={form.prize}
                        onChange={e => setForm({ ...form, prize: e.target.value })}
                        placeholder="$500 Cash or Size 10 Jordans"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 block">
                        Image URL
                    </label>
                    <input
                        type="url"
                        value={form.image_url}
                        onChange={e => setForm({ ...form, image_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                </div>
                <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 block">
                        Ends At *
                    </label>
                    <input
                        type="datetime-local"
                        value={form.ends_at}
                        onChange={e => setForm({ ...form, ends_at: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 [color-scheme:dark]"
                    />
                </div>
                <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 block">
                        Entry Cost (PTS)
                    </label>
                    <input
                        type="number"
                        value={form.entry_cost}
                        onChange={e => setForm({ ...form, entry_cost: parseInt(e.target.value) || 0 })}
                        min={0}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                </div>
            </div>

            {/* Preview */}
            {form.image_url && (
                <div className="rounded-xl border border-white/5 overflow-hidden h-40 bg-zinc-950">
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <span className="flex items-center gap-2"><Plus className="w-5 h-5" /> Create Drop</span>
                )}
            </Button>
        </form>
    )
}
