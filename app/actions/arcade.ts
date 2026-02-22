'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// Game Configurations
const SCRATCH_PRIZES = [
    { value: 10, weight: 60 },
    { value: 25, weight: 30 },
    { value: 50, weight: 8 },
    { value: 100, weight: 2 },
]

const WHEEL_PRIZES = [
    { label: '10', value: 10, weight: 40, color: '#a855f7' },
    { label: '25', value: 25, weight: 30, color: '#3b82f6' },
    { label: '50', value: 50, weight: 20, color: '#ec4899' },
    { label: '100', value: 100, weight: 9, color: '#eab308' },
    { label: 'JACKPOT', value: 500, weight: 1, color: '#f59e0b', special: true },
]

const SLOT_SYMBOLS = ['🍒', '🍋', '🔔', '💎', '7️⃣', '🍀']

const COINFLIP_OUTCOMES = [
    { result: 'heads', value: 15, weight: 48 },
    { result: 'tails', value: 15, weight: 48 },
    { result: 'edge', value: 100, weight: 4 },
]

const HILO_PRIZES = [
    { value: 5, weight: 60 },
    { value: 15, weight: 25 },
    { value: 40, weight: 12 },
    { value: 150, weight: 3 },
]

type GameResult = {
    success: boolean
    pointsWon?: number
    prize?: any
    error?: string
    newTotal?: number
}

function getWeightedRandom<T extends { weight: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight

    for (const item of items) {
        if (random < item.weight) return item
        random -= item.weight
    }
    return items[0]
}

export async function playArcadeGame(gameType: 'scratch' | 'wheel' | 'coinflip' | 'slots' | 'hilo'): Promise<GameResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Use Admin Client for DB Operations to bypass RLS on Points/Profile
    const adminSupabase = createAdminClient()

    try {
        // 1. Determine Result
        let pointsWon = 0
        let prizeData: any = null

        if (gameType === 'scratch') {
            const prize = getWeightedRandom(SCRATCH_PRIZES)
            pointsWon = prize.value
            prizeData = prize
        } else if (gameType === 'wheel') {
            const prize = getWeightedRandom(WHEEL_PRIZES)
            pointsWon = prize.value
            prizeData = prize
        } else if (gameType === 'coinflip') {
            // Player picks heads or tails, server picks result
            const outcome = getWeightedRandom(COINFLIP_OUTCOMES)
            // 50/50 chance - player always "picks heads" for simplicity
            // The client will handle the visual flip
            const playerWins = Math.random() < 0.5
            pointsWon = playerWins ? outcome.value : 0
            prizeData = { ...outcome, playerWins, landed: outcome.result }
        } else if (gameType === 'slots') {
            // Generate 3 reels
            const reel1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
            const reel2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
            const reel3 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
            const reels = [reel1, reel2, reel3]

            if (reel1 === reel2 && reel2 === reel3) {
                // Triple match - JACKPOT
                pointsWon = reel1 === '7️⃣' ? 500 : reel1 === '💎' ? 200 : 75
            } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
                // Double match
                pointsWon = 15
            } else {
                pointsWon = 0
            }
            prizeData = { reels, jackpot: reel1 === reel2 && reel2 === reel3 }
        } else if (gameType === 'hilo') {
            // Server generates two numbers, player guesses if second is higher
            const card1 = Math.floor(Math.random() * 13) + 1 // 1-13
            const card2 = Math.floor(Math.random() * 13) + 1
            const isHigher = card2 > card1
            const isSame = card2 === card1
            // Points based on difficulty (how close the numbers are)
            const diff = Math.abs(card2 - card1)
            if (isSame) {
                pointsWon = 50 // Perfect guess bonus
            } else if (diff <= 2) {
                pointsWon = 25
            } else {
                pointsWon = 10
            }
            prizeData = { card1, card2, isHigher, isSame }
        }

        // 2. Transaction: Update User Points using ADMIN CLIENT
        // Note: In a real high-scale app, use RPC or check for race conditions. 
        // For this scale, a direct fetch-update is acceptable or use a postgres function.

        // Fetch current profile with Admin Client to ensure we get data even if RLS is strict
        const { data: profile, error: fetchError } = await adminSupabase
            .from('profiles')
            .select('points, lifetime_points, last_played_at, email')
            .eq('id', user.id)
            .single()

        if (fetchError || !profile) {
            console.error("Profile Fetch Error (Admin):", fetchError)
            throw new Error('Profile not found')
        }

        // Cooldown disabled for now
        // if (profile.last_played_at) {
        //     const lastPlayed = new Date(profile.last_played_at)
        //     const now = new Date()
        //     const diffHours = (now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60)
        //     if (diffHours < 24) {
        //         if (!isNaN(lastPlayed.getTime())) {
        //             return { success: false, error: 'Daily limit reached. Come back tomorrow!' }
        //         }
        //     }
        // }

        const newPoints = (profile.points || 0) + pointsWon
        const newLifetime = (profile.lifetime_points || 0) + pointsWon

        const { error: updateError } = await adminSupabase
            .from('profiles')
            .update({
                points: newPoints,
                lifetime_points: newLifetime,
                last_played_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (updateError) {
            console.error("Profile Update Error (Admin):", updateError)
            throw updateError
        }

        console.log(`[ARCADE] Updated points for ${user.id}: ${profile.points} -> ${newPoints}`)

        // Log to activity feed if notable win
        if (pointsWon >= 50) {
            try {
                await adminSupabase.from('activity_feed').insert({
                    user_id: user.id,
                    username: profile.email?.split('@')[0] || 'Someone',
                    event_type: pointsWon >= 200 ? 'jackpot' : 'win',
                    description: `won ${pointsWon} PTS on ${gameType}! 🎉`,
                })
            } catch (e) {
                // Non-critical, don't fail the game
            }
        }

        revalidatePath('/dashboard', 'layout')
        revalidatePath('/dashboard/arcade')
        revalidatePath('/dashboard/arcade/scratch')
        revalidatePath('/dashboard/arcade/wheel')
        revalidatePath('/dashboard/arcade/coinflip')
        revalidatePath('/dashboard/arcade/slots')
        revalidatePath('/dashboard/arcade/hilo')

        return {
            success: true,
            pointsWon,
            prize: prizeData,
            newTotal: newPoints
        }

    } catch (error) {
        console.error('Game Error:', error)
        return { success: false, error: 'Failed to process game' }
    }
}
