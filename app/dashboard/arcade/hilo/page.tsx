import { HiLoGame } from '@/components/arcade/games/hi-lo'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HiLoPage() {
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
                <div className="md:hidden font-mono text-yellow-500 font-bold">
                    PTS: {initialPoints.toLocaleString()}
                </div>
            </div>

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-widest">HI-LO</h1>
                <p className="text-zinc-400">Guess if the next card is higher or lower. Close calls = more points!</p>
            </div>

            <HiLoGame initialPoints={initialPoints} />
        </div>
    )
}
