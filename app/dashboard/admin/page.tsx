import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDropForm } from '@/components/admin/admin-drop-form'
import { Shield, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Hardcode admin emails for now. In production, use a role-based system.
const ADMIN_EMAILS = ['kenny@dropclub.com', 'admin@dropclub.com']

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    // Simple admin check - in production use role-based
    // For now, allow any authenticated user to access. Adjust as needed.
    // if (!ADMIN_EMAILS.includes(user.email || '')) return redirect('/dashboard')

    // Fetch existing drops
    const { data: drops } = await supabase
        .from('drops')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto p-6 max-w-5xl min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-red-500/10 ring-1 ring-red-500/30">
                    <Shield className="w-6 h-6 text-red-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white">Admin Panel</h1>
                    <p className="text-zinc-500 text-sm">Create and manage drops</p>
                </div>
            </div>

            {/* Create New Drop */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4">Create New Drop</h2>
                <AdminDropForm />
            </div>

            {/* Existing Drops */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">All Drops ({drops?.length || 0})</h2>
                <div className="space-y-3">
                    {drops?.map((drop: any) => (
                        <div key={drop.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-zinc-900/30">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white truncate">{drop.title}</span>
                                    {drop.winner_id && (
                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">ENDED</span>
                                    )}
                                    {!drop.winner_id && new Date(drop.ends_at) > new Date() && (
                                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">LIVE</span>
                                    )}
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">
                                    Prize: {drop.prize} · Entries: {drop.entry_count || 0} · Cost: {drop.entry_cost || 0} PTS
                                </div>
                            </div>
                            <div className="text-xs text-zinc-600 font-mono shrink-0">
                                {new Date(drop.ends_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
