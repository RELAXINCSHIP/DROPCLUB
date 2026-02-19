'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function Countdown({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const calculateTimeLeft = () => {
            const diff = new Date(targetDate).getTime() - new Date().getTime()
            if (diff <= 0) return 'Ended'

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            if (days > 0) return `${days}d ${hours}h left`
            return `${hours}h ${minutes}m ${seconds}s`
        }

        setTimeLeft(calculateTimeLeft())
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    return (
        <div className="flex items-center gap-1 font-mono text-sm">
            <Clock className="h-4 w-4 text-purple-400" />
            <span className="text-purple-100">{timeLeft}</span>
        </div>
    )
}
