import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Medal, Crown, Star, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    // Fetch top 50 users by lifetime_points
    const { data: leaders } = await supabase
        .from('profiles')
        .select('id, display_name, email, lifetime_points, is_vip, login_streak')
        .order('lifetime_points', { ascending: false })
        .limit(50)

    // Find current user's rank
    const userRank = leaders?.findIndex(l => l.id === user.id) ?? -1

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="w-6 h-6 text-yellow-400" />
        if (index === 1) return <Medal className="w-5 h-5 text-zinc-300" />
        if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />
        return <span className="text-zinc-500 font-mono text-sm w-6 text-center">{index + 1}</span>
    }

    const getRankBg = (index: number) => {
        if (index === 0) return 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]'
        if (index === 1) return 'bg-zinc-400/5 border-zinc-400/20'
        if (index === 2) return 'bg-amber-700/5 border-amber-700/20'
        return 'border-white/5 hover:border-white/10'
    }

    const getDisplayName = (profile: any) => {
        if (profile.display_name) return profile.display_name
        if (profile.email) return profile.email.split('@')[0]
        return 'Anonymous'
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl min-h-screen">
            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-linear-to-r from-yellow-400 via-orange-400 to-red-500 tracking-tighter">
                    LEADERBOARD
                </h1>
                <p className="text-zinc-400">Top earners by lifetime points</p>
            </div>

            {/* Podium - Top 3 */}
            {leaders && leaders.length >= 3 && (
                <div className="flex items-end justify-center gap-3 md:gap-6 mb-12 px-4">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-800 border-2 border-zinc-400/50 flex items-center justify-center text-2xl font-black text-zinc-300 mb-2">
                            2
                        </div>
                        <div className="text-sm font-bold text-white truncate max-w-[100px]">{getDisplayName(leaders[1])}</div>
                        <div className="text-xs text-zinc-400 font-mono">{(leaders[1].lifetime_points || 0).toLocaleString()} PTS</div>
                        <div className="w-20 md:w-28 h-20 bg-zinc-700/50 rounded-t-xl mt-2 border border-zinc-600/30 flex items-center justify-center">
                            <Medal className="w-8 h-8 text-zinc-400" />
                        </div>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center -mb-2">
                        <div className="relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Crown className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            </div>
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-500/60 flex items-center justify-center text-3xl font-black text-yellow-400 mt-4 shadow-[0_0_30px_-5px_rgba(234,179,8,0.4)]">
                                1
                            </div>
                        </div>
                        <div className="text-sm font-bold text-yellow-400 truncate max-w-[120px] mt-2">{getDisplayName(leaders[0])}</div>
                        <div className="text-xs text-yellow-500/80 font-mono">{(leaders[0].lifetime_points || 0).toLocaleString()} PTS</div>
                        <div className="w-24 md:w-32 h-28 bg-yellow-500/10 rounded-t-xl mt-2 border border-yellow-500/20 flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-yellow-500/60" />
                        </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-800 border-2 border-amber-700/50 flex items-center justify-center text-2xl font-black text-amber-600 mb-2">
                            3
                        </div>
                        <div className="text-sm font-bold text-white truncate max-w-[100px]">{getDisplayName(leaders[2])}</div>
                        <div className="text-xs text-zinc-400 font-mono">{(leaders[2].lifetime_points || 0).toLocaleString()} PTS</div>
                        <div className="w-20 md:w-28 h-16 bg-amber-900/20 rounded-t-xl mt-2 border border-amber-800/30 flex items-center justify-center">
                            <Medal className="w-8 h-8 text-amber-700" />
                        </div>
                    </div>
                </div>
            )}

            {/* Your Rank */}
            {userRank >= 0 && (
                <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 font-bold">Your Rank</span>
                    </div>
                    <span className="text-white font-mono font-black text-xl">#{userRank + 1}</span>
                </div>
            )}

            {/* Full Rankings */}
            <div className="space-y-2">
                {leaders?.map((leader: any, index: number) => (
                    <div
                        key={leader.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${getRankBg(index)} ${leader.id === user.id ? 'ring-1 ring-purple-500/50' : ''}`}
                    >
                        {/* Rank */}
                        <div className="w-8 flex justify-center">
                            {getRankIcon(index)}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold truncate ${index < 3 ? 'text-white' : 'text-zinc-300'}`}>
                                    {getDisplayName(leader)}
                                </span>
                                {leader.is_vip && (
                                    <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full ring-1 ring-yellow-500/40">VIP</span>
                                )}
                                {leader.id === user.id && (
                                    <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">YOU</span>
                                )}
                            </div>
                            {leader.login_streak > 0 && (
                                <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                    <TrendingUp className="w-3 h-3" /> {leader.login_streak} day streak
                                </div>
                            )}
                        </div>

                        {/* Points */}
                        <div className={`font-mono font-bold text-right ${index === 0 ? 'text-yellow-400 text-lg' : index < 3 ? 'text-white' : 'text-zinc-400'}`}>
                            {(leader.lifetime_points || 0).toLocaleString()}
                            <span className="text-xs ml-1 opacity-60">PTS</span>
                        </div>
                    </div>
                ))}
            </div>

            {(!leaders || leaders.length === 0) && (
                <div className="text-center py-16 text-zinc-500">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
                    <p className="text-xl font-bold">No players yet</p>
                    <p className="text-sm">Be the first to climb the ranks!</p>
                </div>
            )}
        </div>
    )
}
