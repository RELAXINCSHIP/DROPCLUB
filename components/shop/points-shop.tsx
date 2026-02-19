'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins, Loader2, DollarSign, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const POINT_PACKS = [
    {
        id: 'pack_small',
        name: 'Handful of Points',
        points: 100,
        price: 5000, // in cents ($50.00)
        description: 'Enough to enter ~20 standard drops.',
        popular: false,
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    },
    {
        id: 'pack_medium',
        name: 'Bag of Points',
        points: 500,
        price: 20000, // in cents ($200.00)
        description: 'Serious players only. Best value.',
        popular: true,
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/50'
    },
    {
        id: 'pack_large',
        name: 'Chest of Points',
        points: 1500,
        price: 50000, // in cents ($500.00)
        description: 'Whale status. Dominate the vault.',
        popular: false,
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    }
]

export function PointsShop() {
    const [loadingPack, setLoadingPack] = useState<string | null>(null)

    const handlePurchase = async (packId: string) => {
        setLoadingPack(packId)
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    packId,
                    successUrl: window.location.origin + '/dashboard?success=true',
                    cancelUrl: window.location.href,
                }),
            })

            const { url, error } = await response.json()
            if (error) throw new Error(error)
            if (url) window.location.href = url

        } catch (error: any) {
            console.error('Purchase Error:', error)
            toast.error(error.message || 'Failed to initiate checkout')
        } finally {
            setLoadingPack(null)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {POINT_PACKS.map((pack) => (
                <motion.div
                    key={pack.id}
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <Card className={`relative overflow-hidden border bg-zinc-900/40 backdrop-blur-xl ${pack.popular ? 'border-purple-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]' : 'border-zinc-800'}`}>
                        {pack.popular && (
                            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg">
                                POPULAR
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Coins className={`h-6 w-6 ${pack.id === 'pack_small' ? 'text-blue-400' : pack.id === 'pack_medium' ? 'text-purple-400' : 'text-yellow-400'}`} />
                                {pack.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                                {pack.points} PTS
                            </div>
                            <p className="text-zinc-400 text-sm h-10">{pack.description}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">${(pack.price / 100).toFixed(2)}</span>
                                <span className="text-sm text-zinc-500">USD</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className={`w-full font-bold h-12 text-md transition-all ${pack.popular ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}
                                onClick={() => handlePurchase(pack.id)}
                                disabled={!!loadingPack}
                            >
                                {loadingPack === pack.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Zap className="mr-2 h-4 w-4 fill-current" />
                                )}
                                Buy Now
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}

// Export constant for API use
export { POINT_PACKS }
