'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import confetti from 'canvas-confetti'
import { CheckCircle2, Package } from 'lucide-react'

interface ClaimPrizeButtonProps {
    dropId: number
    dropTitle: string
    prizeName: string
}

export function ClaimPrizeButton({ dropId, dropTitle, prizeName }: ClaimPrizeButtonProps) {
    const [open, setOpen] = useState(false)
    const [orderId, setOrderId] = useState('')

    const handleClaim = () => {
        // 1. Fire Confetti
        const duration = 3000
        const end = Date.now() + duration

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#EAB308', '#ffffff'] // Gold and White
            })
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#EAB308', '#ffffff']
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }
        frame()

        // 2. Generate Fake Order ID
        const fakeId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        setOrderId(fakeId)

        // 3. Open Modal
        setOpen(true)
    }

    return (
        <>
            <Button
                onClick={handleClaim}
                variant="outline"
                className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20"
            >
                Claim Prize
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md border-yellow-500/20 bg-zinc-900 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl text-yellow-500">
                            <CheckCircle2 className="h-6 w-6" />
                            Prize Claimed!
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Congratulations on winning the <strong>{dropTitle}</strong>!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-black/20 rounded-lg border border-white/5">
                        <Package className="h-12 w-12 text-yellow-500/80" />
                        <div className="text-center space-y-1">
                            <p className="text-sm text-zinc-500 uppercase tracking-widest">Order ID</p>
                            <p className="text-2xl font-mono font-bold text-white tracking-wider">{orderId}</p>
                        </div>
                        <div className="text-center text-sm text-zinc-400 max-w-xs">
                            Our team is preparing your <strong>{prizeName}</strong> for shipment. You will receive a tracking number via email within 24 hours.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => setOpen(false)}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                        >
                            Got it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
