'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ArrowDown, Equal, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { playArcadeGame } from '@/app/actions/arcade'
import Link from 'next/link'
import { useSoundFX } from '@/hooks/use-sound-fx'
import { useRouter } from 'next/navigation'

const CARD_NAMES = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const CARD_SUITS = ['♠️', '♥️', '♦️', '♣️']

interface HiLoGameProps {
    initialPoints: number
}

export function HiLoGame({ initialPoints }: HiLoGameProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [card1, setCard1] = useState<number | null>(null)
    const [card2, setCard2] = useState<number | null>(null)
    const [guess, setGuess] = useState<'higher' | 'lower' | null>(null)
    const [result, setResult] = useState<{ won: boolean; points: number } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentPoints, setCurrentPoints] = useState(initialPoints)
    const [revealed, setRevealed] = useState(false)
    const [suit1] = useState(CARD_SUITS[Math.floor(Math.random() * 4)])
    const [suit2] = useState(CARD_SUITS[Math.floor(Math.random() * 4)])
    const router = useRouter()
    const { play } = useSoundFX()

    const startGame = async () => {
        if (isPlaying) return
        setIsPlaying(true)
        setResult(null)
        setError(null)
        setRevealed(false)
        setGuess(null)

        try {
            const res = await playArcadeGame('hilo')

            if (!res.success) {
                setError(res.error || 'Failed to play')
                setIsPlaying(false)
                return
            }

            setCard1(res.prize?.card1)
            setCard2(res.prize?.card2)
        } catch (e) {
            console.error(e)
            setError('Something went wrong')
            setIsPlaying(false)
        }
    }

    const makeGuess = async (playerGuess: 'higher' | 'lower') => {
        if (!card1 || !card2 || revealed) return

        setGuess(playerGuess)
        play('tick')

        // Reveal after short delay
        await new Promise(r => setTimeout(r, 800))
        setRevealed(true)

        const isHigher = card2 > card1
        const isSame = card2 === card1

        let won = false
        if (isSame) {
            won = true // Same card = always win
        } else if (playerGuess === 'higher' && isHigher) {
            won = true
        } else if (playerGuess === 'lower' && !isHigher) {
            won = true
        }

        // Points based on difficulty
        const diff = Math.abs(card2 - card1)
        let pts = 0
        if (won) {
            if (isSame) pts = 50
            else if (diff <= 2) pts = 25
            else pts = 10
        }

        setResult({ won, points: pts })
        setIsPlaying(false)

        if (won && pts > 0) {
            play('win')
            setCurrentPoints(prev => prev + pts)
            confetti({
                particleCount: pts >= 50 ? 200 : 80,
                spread: 70,
                origin: { y: 0.6 },
            })
            toast.success(`+${pts} PTS!`)
        } else {
            play('pop')
            toast('Wrong guess!')
        }

        router.refresh()
    }

    if (error) {
        return (
            <div className="w-full max-w-lg mx-auto bg-zinc-900 border border-red-500/30 rounded-3xl p-8 text-center mt-12">
                <h2 className="text-xl font-bold text-red-400 mb-2">Daily Limit Reached</h2>
                <p className="text-zinc-400 mb-6">{error}</p>
                <Link href="/dashboard/arcade">
                    <Button variant="outline">Come Back Tomorrow</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            {/* Points Display */}
            <div className="mb-8 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-400 font-mono font-bold text-sm">{currentPoints.toLocaleString()} PTS</span>
            </div>

            {/* Cards */}
            <div className="flex items-center gap-6 md:gap-12 mt-8 mb-12">
                {/* Card 1 */}
                <motion.div
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: card1 ? 1 : 0.8, rotateY: card1 ? 0 : 180 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-32 h-48 md:w-40 md:h-56 rounded-2xl bg-white shadow-[0_0_40px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center relative overflow-hidden"
                >
                    {card1 ? (
                        <>
                            <div className="text-5xl font-black text-blue-600">{CARD_NAMES[card1]}</div>
                            <div className="text-2xl mt-1">{suit1}</div>
                        </>
                    ) : (
                        <div className="text-4xl text-zinc-300">?</div>
                    )}
                </motion.div>

                {/* VS */}
                <div className="text-zinc-600 font-black text-2xl">VS</div>

                {/* Card 2 */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{
                        scale: revealed ? 1 : card1 ? 0.95 : 0.8,
                        rotateY: revealed ? 0 : 180,
                    }}
                    transition={{ type: 'spring', damping: 15 }}
                    className={`w-32 h-48 md:w-40 md:h-56 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden ${revealed
                            ? 'bg-white shadow-[0_0_40px_rgba(59,130,246,0.3)]'
                            : 'bg-gradient-to-br from-indigo-600 to-purple-700 border-2 border-indigo-400/30'
                        }`}
                >
                    {revealed && card2 ? (
                        <>
                            <div className={`text-5xl font-black ${result?.won ? 'text-green-600' : 'text-red-600'}`}>
                                {CARD_NAMES[card2]}
                            </div>
                            <div className="text-2xl mt-1">{suit2}</div>
                        </>
                    ) : (
                        <div className="text-4xl text-white/80 font-black">?</div>
                    )}
                </motion.div>
            </div>

            {/* Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-6"
                    >
                        <div className={`text-4xl font-black mb-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                            {result.won ? `+${result.points} PTS!` : 'WRONG!'}
                        </div>
                        {card1 && card2 && (
                            <div className="text-zinc-400 text-sm">
                                {CARD_NAMES[card1]} → {CARD_NAMES[card2]}
                                {card2 > card1 ? ' (Higher)' : card2 < card1 ? ' (Lower)' : ' (Same!)'}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex flex-col gap-4 w-full max-w-xs">
                {!card1 && !isPlaying ? (
                    <Button
                        onClick={startGame}
                        size="lg"
                        className="w-full font-black text-xl h-16 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] border-t border-white/20 transform hover:scale-105 active:scale-95 transition-all"
                    >
                        DEAL CARDS
                    </Button>
                ) : card1 && !revealed ? (
                    <div className="flex gap-3">
                        <Button
                            onClick={() => makeGuess('higher')}
                            disabled={!!guess}
                            size="lg"
                            className={`flex-1 font-black text-lg h-16 transition-all ${guess === 'higher'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                }`}
                        >
                            <ArrowUp className="w-5 h-5 mr-1" /> HIGHER
                        </Button>
                        <Button
                            onClick={() => makeGuess('lower')}
                            disabled={!!guess}
                            size="lg"
                            className={`flex-1 font-black text-lg h-16 transition-all ${guess === 'lower'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                                }`}
                        >
                            <ArrowDown className="w-5 h-5 mr-1" /> LOWER
                        </Button>
                    </div>
                ) : result ? (
                    <Link href="/dashboard/arcade">
                        <Button size="lg" className="w-full bg-white text-black hover:bg-zinc-200 font-bold text-xl h-14">
                            CONTINUE
                        </Button>
                    </Link>
                ) : (
                    <div className="text-center text-zinc-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                )}

                <p className="text-zinc-500 text-xs text-center font-mono">
                    CLOSE CALL = 25 PTS • SAME CARD = 50 PTS
                </p>
            </div>
        </div>
    )
}
