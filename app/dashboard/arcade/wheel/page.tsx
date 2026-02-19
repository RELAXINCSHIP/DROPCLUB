import { PrizeWheelGame } from '@/components/arcade/games/prize-wheel'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function WheelPage() {
    return (
        <div className="container mx-auto p-6 max-w-4xl min-h-screen flex flex-col items-center justify-center">
            <div className="w-full mb-8">
                <Link href="/dashboard/arcade" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Arcade
                </Link>
            </div>

            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 font-[family-name:var(--font-glitch)] tracking-widest text-shadow-lg shadow-purple-500/50">PRIZE WHEEL</h1>
                <p className="text-zinc-400">Spin for a chance to win the daily jackpot of 500 bonus points!</p>
            </div>

            <PrizeWheelGame />
        </div>
    )
}
