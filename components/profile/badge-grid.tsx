'use client'

interface BadgeGridProps {
    achievements: any[]
    earnedSlugs: Set<string>
}

export function BadgeGrid({ achievements, earnedSlugs }: BadgeGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {achievements.map((a: any) => {
                const earned = earnedSlugs.has(a.slug)
                return (
                    <div
                        key={a.id}
                        className={`rounded-xl border p-4 text-center transition-all ${earned
                                ? 'border-purple-500/30 bg-purple-500/10 shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]'
                                : 'border-white/5 bg-white/[0.02] opacity-40 grayscale'
                            }`}
                    >
                        <div className="text-3xl mb-2">{a.icon}</div>
                        <div className={`font-bold text-sm ${earned ? 'text-white' : 'text-zinc-500'}`}>
                            {a.title}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">{a.description}</div>
                        {earned && (
                            <div className="text-[10px] text-purple-400 font-bold mt-2 uppercase tracking-wider">
                                ✅ Unlocked
                            </div>
                        )}
                        {!earned && a.points_reward > 0 && (
                            <div className="text-[10px] text-zinc-600 font-mono mt-2">
                                +{a.points_reward} PTS
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
