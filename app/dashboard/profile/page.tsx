import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Flame, Zap, Star, Medal, Gift, Copy, Share2, Users, TrendingUp, Award } from 'lucide-react'
import { ReferralWidget } from '@/components/profile/referral-widget'
import { BadgeGrid } from '@/components/profile/badge-grid'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch user achievements
    const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', user.id)

    // Fetch all achievements for badge display
    const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('id')

    // Count entries
    const { count: entryCount } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // Count wins
    const { count: winCount } = await supabase
        .from('drops')
        .select('*', { count: 'exact', head: true })
        .eq('winner_id', user.id)

    // Count referrals
    const { count: referralCount } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id)

    // Rank
    const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, lifetime_points')
        .order('lifetime_points', { ascending: false })

    const rank = (allProfiles?.findIndex(p => p.id === user.id) ?? -1) + 1

    const points = profile?.points || 0
    const lifetimePoints = profile?.lifetime_points || 0
    const streak = profile?.login_streak || 0
    const isVip = profile?.is_vip || false
    const displayName = profile?.display_name || user.email?.split('@')[0] || 'Player'
    const referralCode = profile?.referral_code || ''

    const earnedSlugs = new Set(userAchievements?.map((ua: any) => ua.achievements?.slug) || [])

    return (
        <div className="container mx-auto p-6 max-w-4xl min-h-screen">
            {/* Profile Header */}
            <div className="relative rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-8 mb-8 overflow-hidden">
                {/* VIP Glow */}
                {isVip && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
                )}

                <div className="relative flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black ${isVip ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-black ring-4 ring-yellow-500/30' : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white ring-4 ring-purple-500/20'}`}>
                        {displayName[0].toUpperCase()}
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <h1 className="text-3xl font-black text-white">{displayName}</h1>
                            {isVip && (
                                <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full ring-1 ring-yellow-500/40">
                                    👑 VIP
                                </span>
                            )}
                        </div>
                        <p className="text-zinc-400 text-sm mt-1">{user.email}</p>
                        {rank > 0 && (
                            <p className="text-zinc-500 text-sm mt-1">
                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                Ranked #{rank} globally
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                        <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <div className="text-2xl font-black text-white">{points.toLocaleString()}</div>
                        <div className="text-xs text-zinc-500">Points</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                        <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="text-2xl font-black text-white">{lifetimePoints.toLocaleString()}</div>
                        <div className="text-xs text-zinc-500">Lifetime</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                        <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                        <div className="text-2xl font-black text-white">{streak}</div>
                        <div className="text-xs text-zinc-500">Day Streak</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                        <Trophy className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-2xl font-black text-white">{winCount || 0}</div>
                        <div className="text-xs text-zinc-500">Wins</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                        <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <div className="text-2xl font-black text-white">{entryCount || 0}</div>
                        <div className="text-xs text-zinc-500">Entries</div>
                    </div>
                </div>
            </div>

            {/* Achievements / Badges */}
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-purple-400" /> Achievements
                </h2>
                <BadgeGrid achievements={allAchievements || []} earnedSlugs={earnedSlugs} />
            </div>

            {/* Referral Widget */}
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                    <Share2 className="w-6 h-6 text-pink-400" /> Invite Friends
                </h2>
                <ReferralWidget code={referralCode} referralCount={referralCount || 0} />
            </div>
        </div>
    )
}
