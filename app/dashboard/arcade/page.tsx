import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArcadeStats } from '@/components/arcade/arcade-stats'
import { GameCard } from '@/components/arcade/game-card'
import { Ticket, Dna, Gift, Coins, Cherry, ArrowUpDown } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ArcadePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('points, streak_days, lifetime_points')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
    }

    if (!profile) {
        console.warn('No profile found for user:', user.id)
    }

    // Default values if profile fetch fails or fields are null (schema update prop)
    const points = profile?.points || 0
    const streak = profile?.streak_days || 0
    const lifetimePoints = profile?.lifetime_points || 0

    return (
        <div className="container mx-auto p-6 max-w-7xl min-h-screen">
            {/* Header */}
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 animate-shimmer bg-[200%_auto] tracking-tighter">
                    ARCADE
                </h1>
                <p className="text-zinc-400 text-lg">Play games. Earn points. Redeem rewards.</p>
            </div>

            {/* Stats Section */}
            <ArcadeStats points={points} streak={streak} lifetimePoints={lifetimePoints} />

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                <GameCard
                    title="SCRATCH & WIN"
                    description="Reveal hidden points with a satisfying scratch."
                    icon={<Ticket className="w-10 h-10 text-pink-400" />}
                    color="from-pink-500/50 to-purple-500/50"
                    href="/dashboard/arcade/scratch"
                    delay={0.1}
                />
                <GameCard
                    title="PRIZE WHEEL"
                    description="Spin the wheel for a chance at huge point bonuses."
                    icon={<Dna className="w-10 h-10 text-cyan-400" />}
                    color="from-cyan-500/50 to-blue-500/50"
                    href="/dashboard/arcade/wheel"
                    delay={0.2}
                />
                <GameCard
                    title="REDEMPTION"
                    description="Exchange your hard-earned points for exclusive perks."
                    icon={<Gift className="w-10 h-10 text-yellow-400" />}
                    color="from-yellow-500/50 to-orange-500/50"
                    href="/dashboard/arcade/store"
                    delay={0.3}
                />
                <GameCard
                    title="COIN FLIP"
                    description="50/50 double or nothing. Land on edge for 100 PTS!"
                    icon={<Coins className="w-10 h-10 text-amber-400" />}
                    color="from-amber-500/50 to-yellow-500/50"
                    href="/dashboard/arcade/coinflip"
                    delay={0.4}
                />
                <GameCard
                    title="SLOTS"
                    description="Pull the lever! Match 3 symbols for a massive jackpot."
                    icon={<Cherry className="w-10 h-10 text-red-400" />}
                    color="from-red-500/50 to-orange-500/50"
                    href="/dashboard/arcade/slots"
                    delay={0.5}
                />
                <GameCard
                    title="HI-LO"
                    description="Guess if the next card is higher or lower. Close calls pay more!"
                    icon={<ArrowUpDown className="w-10 h-10 text-blue-400" />}
                    color="from-blue-500/50 to-indigo-500/50"
                    href="/dashboard/arcade/hilo"
                    delay={0.6}
                />
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-zinc-900/30 border border-white/5 text-center">
                <p className="text-zinc-500 text-sm font-mono">
                    NOTE: ARCADE POINTS ARE FOR COSMETIC/LIFESTYLE REWARDS ONLY. THEY DO NOT INCREASE SWEEPSTAKES ODDS. APPLE COMPLIANT.
                </p>
            </div>
        </div>
    )
}
