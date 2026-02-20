import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Package, Clock, Sparkles } from 'lucide-react'
import { ClaimPrizeButton } from '@/components/vault/claim-prize-button'

export const dynamic = 'force-dynamic'

export default async function VaultPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch drops where user is the winner
    const { data: wins } = await supabase
        .from('drops')
        .select('*')
        .eq('winner_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch user's entered drops (active entries)
    const { data: entries } = await supabase
        .from('entries')
        .select('drop_id, drops(id, title, prize, image_url, ends_at, status)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    return (
        <div className="container mx-auto p-6 max-w-5xl min-h-screen">
            {/* Header */}
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-linear-to-r from-yellow-400 via-amber-400 to-yellow-600 tracking-tighter">
                    THE VAULT
                </h1>
                <p className="text-zinc-400 text-lg">Your wins and active entries.</p>
            </div>

            {/* Wins Section */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <h2 className="text-2xl font-black text-white tracking-tight">Your Wins</h2>
                </div>

                {wins && wins.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {wins.map((drop: any) => (
                            <div
                                key={drop.id}
                                className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-zinc-900/60 backdrop-blur-xl group hover:border-yellow-500/50 transition-all duration-300"
                            >
                                {/* Glow */}
                                <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors" />

                                {/* Image */}
                                <div className="aspect-video w-full relative overflow-hidden">
                                    {drop.image_url ? (
                                        <img
                                            src={drop.image_url}
                                            alt={drop.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <Package className="h-12 w-12 text-zinc-600" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-yellow-500/50 backdrop-blur-md flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        WINNER
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 relative">
                                    <h3 className="text-xl font-bold text-white mb-1">{drop.title}</h3>
                                    <p className="text-yellow-400 font-medium mb-4">{drop.prize}</p>
                                    <ClaimPrizeButton
                                        dropId={drop.id}
                                        dropTitle={drop.title}
                                        prizeName={drop.prize}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 rounded-2xl border border-white/5 bg-zinc-900/30">
                        <Trophy className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-500 mb-2">No Wins Yet</h3>
                        <p className="text-zinc-600 text-sm max-w-md mx-auto">
                            Keep entering drops for your chance to win! Your prizes will appear here.
                        </p>
                    </div>
                )}
            </section>

            {/* Entry History */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="h-6 w-6 text-purple-400" />
                    <h2 className="text-2xl font-black text-white tracking-tight">Entry History</h2>
                </div>

                {entries && entries.length > 0 ? (
                    <div className="space-y-3">
                        {entries.map((entry: any) => {
                            const drop = entry.drops
                            if (!drop) return null
                            const ended = new Date(drop.ends_at) < new Date()
                            return (
                                <div
                                    key={entry.drop_id}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-zinc-900/40 hover:border-white/10 transition-colors"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                                        {drop.image_url ? (
                                            <img src={drop.image_url} alt={drop.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-6 w-6 text-zinc-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white truncate">{drop.title}</h4>
                                        <p className="text-sm text-zinc-400">{drop.prize}</p>
                                    </div>

                                    {/* Status */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${ended
                                        ? 'bg-zinc-800 text-zinc-500 ring-1 ring-zinc-700'
                                        : 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30 animate-pulse'
                                        }`}>
                                        {ended ? 'Ended' : 'Active'}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 rounded-2xl border border-white/5 bg-zinc-900/30">
                        <Clock className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500">No entries yet. Go enter some drops!</p>
                    </div>
                )}
            </section>
        </div>
    )
}
