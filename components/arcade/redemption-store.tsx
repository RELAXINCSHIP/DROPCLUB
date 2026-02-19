'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Sparkles, BellRing, Palette, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const REWARDS = [
    {
        id: 'badge_vip',
        name: 'VIP Badge',
        description: 'Show off your status with a golden profile badge.',
        cost: 500,
        icon: <Crown className="w-8 h-8 text-yellow-400" />
    },
    {
        id: 'early_access',
        name: 'Early Drop Alerts',
        description: 'Get notified 5 minutes before drops go live.',
        cost: 300,
        icon: <BellRing className="w-8 h-8 text-red-400" />
    },
    {
        id: 'theme_neon',
        name: 'Neon Dashboard Theme',
        description: 'Unlock the exclusive Cyber-Neon color scheme.',
        cost: 200,
        icon: <Palette className="w-8 h-8 text-pink-400" />
    },
    {
        id: 'double_xp',
        name: 'Double Points Weekend',
        description: 'Earn 2x points on all games for 48 hours.',
        cost: 150,
        icon: <Sparkles className="w-8 h-8 text-cyan-400" />
    }
]

export function RedemptionStore({ userPoints }: { userPoints: number }) {
    const [purchasing, setPurchasing] = useState<string | null>(null)
    const router = useRouter()

    const handlePurchase = async (reward: typeof REWARDS[0]) => {
        if (userPoints < reward.cost) {
            toast.error("Not enough points!")
            return
        }

        setPurchasing(reward.id)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Deduct points
        const { error: pointError } = await supabase.from('profiles').update({
            points: userPoints - reward.cost
        }).eq('id', user.id)

        if (pointError) {
            toast.error("Transaction failed")
            setPurchasing(null)
            return
        }

        // Record redemption
        const { error: redemptionError } = await supabase.from('redemptions').insert({
            user_id: user.id,
            reward_id: reward.id,
            cost: reward.cost
        })

        if (redemptionError) {
            toast.error("Failed to record redemption")
        } else {
            toast.success(`Redeemed: ${reward.name}`)
            router.refresh()
        }

        setPurchasing(null)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {REWARDS.map((reward, i) => (
                <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-md flex flex-col justify-between group hover:border-white/30 transition-colors"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-300">
                            {reward.icon}
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white border border-white/10">
                            {reward.cost} PTS
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                        <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">{reward.description}</p>

                        <Button
                            className={`w-full font-bold ${userPoints >= reward.cost ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                            disabled={userPoints < reward.cost || purchasing === reward.id}
                            onClick={() => handlePurchase(reward)}
                        >
                            {purchasing === reward.id ? (
                                <span className="animate-pulse">PROCESSING...</span>
                            ) : userPoints >= reward.cost ? (
                                'REDEEM'
                            ) : (
                                `NEED ${reward.cost - userPoints} MORE`
                            )}
                        </Button>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
