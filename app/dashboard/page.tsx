import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DropCard } from '@/components/drops/drop-card'
import { ClaimPrizeButton } from '@/components/vault/claim-prize-button'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SubscribeButton } from '@/components/stripe/subscribe-button'
import { Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch drops
    const { data: drops, error: dropsError } = await supabase
        .from('drops')
        .select('*')
        .order('ends_at', { ascending: true })

    // Fetch user entries
    const { data: entries, error: entriesError } = await supabase
        .from('entries')
        .select('drop_id')
        .eq('user_id', user.id)

    // Fetch user profile for subscription status
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single()

    const isSubscribed = profile?.subscription_status === 'active' || profile?.subscription_status === 'pro'
    const enteredDropIds = new Set(entries?.map(e => e.drop_id) || [])

    // Filter wins (drops where winner_id matches user.id)
    const wins = drops?.filter(drop => drop.winner_id === user.id) || []

    // Filter active drops (drops where winner_id is null AND ends_at > now)
    // Or just show all? Usually active drops shouldn't have a winner yet.
    // Let's filter out completed/won drops from the main list so it's not cluttered
    const activeDrops = drops?.filter(drop => !drop.winner_id) || []


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Active Drops</h2>
                    <p className="text-muted-foreground">New chances to win every single day.</p>
                </div>
                {isSubscribed ? (
                    <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-full text-sm font-semibold border border-green-500/20 w-fit">
                        Member Active
                    </div>
                ) : (
                    <div className="w-full md:w-auto">
                        <SubscribeButton priceId="price_1T2LzWRzX9jiFfU6ThMu696z" />
                    </div>
                )}
            </div>

            {(!activeDrops || activeDrops.length === 0) ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                    No active drops right now. Check back later!
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {activeDrops.map((drop) => (
                        <DropCard
                            key={drop.id}
                            id={drop.id}
                            title={drop.title}
                            prize={drop.prize}
                            image={drop.image_url || '/placeholder.jpg'}
                            endsAt={drop.ends_at}
                            entryCost={drop.entry_cost || 0}
                            entries={drop.entry_count || 0}
                            entries={drop.entry_count || 0}
                            isEntered={enteredDropIds.has(drop.id)}
                        />
                    ))}
                </div>
            )}

            <div className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Your Vault</h2>

                {wins.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {wins.map((drop) => (
                            <div key={drop.id} className="relative overflow-hidden rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                                <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded-bl-lg">
                                    WINNER
                                </div>
                                <Trophy className="h-12 w-12 text-yellow-500 mb-4" />
                                <h3 className="text-xl font-bold text-yellow-100">{drop.title}</h3>
                                <p className="text-yellow-200/80 mb-4">You won: {drop.prize}</p>
                                <p className="text-yellow-200/80 mb-4">You won: {drop.prize}</p>
                                <ClaimPrizeButton dropId={drop.id} dropTitle={drop.title} prizeName={drop.prize} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="text-center py-12 text-muted-foreground">
                            <p>You haven't won any drops yet.</p>
                            <p className="text-sm">Keep entering! persistence pays off.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
