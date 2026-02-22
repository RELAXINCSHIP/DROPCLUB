'use client'

import { useState } from 'react'
import { Copy, Check, Twitter, MessageCircle, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ReferralWidgetProps {
    code: string
    referralCount: number
}

export function ReferralWidget({ code, referralCount }: ReferralWidgetProps) {
    const [copied, setCopied] = useState(false)

    const referralLink = typeof window !== 'undefined'
        ? `${window.location.origin}/signup?ref=${code}`
        : `https://dropclub.com/signup?ref=${code}`

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        toast.success('Referral link copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    const shareText = `Join DropClub and get 50 FREE points! Use my code: ${code}`

    const shareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`, '_blank')
    }

    const shareWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${referralLink}`)}`, '_blank')
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Referral code + copy */}
                <div className="flex-1">
                    <p className="text-zinc-400 text-sm mb-3">Share your link — you both get <span className="text-white font-bold">50 PTS</span></p>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-black rounded-xl px-4 py-3 border border-white/10 font-mono text-sm text-zinc-300 truncate">
                            {referralLink}
                        </div>
                        <Button
                            onClick={copyLink}
                            variant="outline"
                            className="border-white/10 hover:bg-white/10 shrink-0"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>

                    {/* Your Code Badge */}
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-zinc-500">Your code:</span>
                        <span className="bg-purple-500/20 text-purple-300 font-mono font-bold text-sm px-2 py-0.5 rounded ring-1 ring-purple-500/30">
                            {code}
                        </span>
                    </div>
                </div>

                {/* Share Buttons */}
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={shareTwitter}
                        className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold gap-2"
                    >
                        <Twitter className="w-4 h-4" /> Share on X
                    </Button>
                    <Button
                        onClick={shareWhatsApp}
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold gap-2"
                    >
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                    </Button>
                </div>
            </div>

            {/* Referral Stats */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Share2 className="w-4 h-4" />
                    <span><span className="text-white font-bold">{referralCount}</span> friends referred</span>
                </div>
                <div className="text-zinc-500 text-sm font-mono">
                    +{referralCount * 50} PTS earned
                </div>
            </div>
        </div>
    )
}
