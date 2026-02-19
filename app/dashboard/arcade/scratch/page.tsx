import { ScratchCardGame } from '@/components/arcade/games/scratch-card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ScratchPage() {
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
                {/* Mobile visible balance for reassurance */}
                <div className="md:hidden font-mono text-yellow-500 font-bold">
                    PTS: {initialPoints.toLocaleString()}
                </div>
            </div>

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 font-[family-name:var(--font-glitch)] tracking-widest">SCRATCH & WIN</h1>
                <p className="text-zinc-400">Rub away the surface to reveal up to 100 points!</p>
            </div>

            <ScratchCardGame initialPoints={initialPoints} />
        </div>
    )
}
