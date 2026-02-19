'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import getStripe from '@/lib/stripe'
import { Loader2, Crown } from 'lucide-react'

export function SubscribeButton({ priceId }: { priceId?: string }) {
    const [loading, setLoading] = useState(false)

    const handleSubscribe = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Use prop or env var
                    priceId: priceId || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
                }),
            })

            const responseText = await response.text()
            let url, error
            try {
                const json = JSON.parse(responseText)
                url = json.url
                error = json.error
            } catch (e) {
                console.error("Failed to parse JSON", responseText)
                throw new Error(`Server Error: ${response.status} ${response.statusText} - ${responseText.slice(0, 100)}`)
            }

            if (error) {
                alert(error)
                setLoading(false)
                return
            }

            if (url) {
                window.location.href = url
            } else {
                throw new Error('No checkout URL returned')
            }
        } catch (e: any) {
            console.error(e)
            alert('Debug Error: ' + (e?.message || JSON.stringify(e)))
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold border-0"
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}
            Become a Member
        </Button>
    )
}
