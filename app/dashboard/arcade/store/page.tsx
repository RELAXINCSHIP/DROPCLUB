import { createClient } from '@/utils/supabase/server'
import { RedemptionStore } from '@/components/arcade/redemption-store'
import Link from 'next/link'
import { ArrowLeft, Coins } from 'lucide-react'

export default async function StorePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch updated points
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', user?.id).single()
    const points = profile?.points || 0

    return (
        <div className="container mx-auto p-6 max-w-4xl min-h-screen">
            <div className="w-full mb-8 flex items-center justify-between">
                <Link href="/dashboard/arcade" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Arcade
                </Link>

                <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-white/10">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-white">{points.toLocaleString()} PTS</span>
                </div>
            </div>

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 font-[family-name:var(--font-glitch)] tracking-widest text-shadow-lg shadow-pink-500/50">REWARDS STORE</h1>
                <p className="text-zinc-400">Burn points. Get clout. No real money required.</p>
            </div>

            <RedemptionStore userPoints={points} />
        </div>
    )
}
