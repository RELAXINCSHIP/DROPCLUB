import { PrizeWheelGame } from '@/components/arcade/games/prize-wheel'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function WheelPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single()

    const initialPoints = profile?.points || 0

    return (
        <div className="container mx-auto p-6 max-w-4xl min-h-screen flex flex-col items-center justify-center">
            <div className="w-full mb-8 flex justify-between items-center">
                <Link href="/dashboard/arcade" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Arcade
                </Link>
                {/* Mobile visible balance */}
                <div className="md:hidden font-mono text-yellow-500 font-bold">
                    PTS: {initialPoints.toLocaleString()}
                </div>
            </div>

            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 font-[family-name:var(--font-glitch)] tracking-widest text-shadow-lg shadow-purple-500/50">PRIZE WHEEL</h1>
                <p className="text-zinc-400">Spin for a chance to win the daily jackpot of 500 bonus points!</p>
            </div>

            <PrizeWheelGame initialPoints={initialPoints} />
        </div>
    )
}
