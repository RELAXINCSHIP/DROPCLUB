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

export async function playArcadeGame(gameType: 'scratch' | 'wheel'): Promise<GameResult> {
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
        let prizeData = null

        if (gameType === 'scratch') {
            const prize = getWeightedRandom(SCRATCH_PRIZES)
            pointsWon = prize.value
            prizeData = prize
        } else if (gameType === 'wheel') {
            const prize = getWeightedRandom(WHEEL_PRIZES)
            pointsWon = prize.value
            prizeData = prize
        }

        // 2. Transaction: Update User Points using ADMIN CLIENT
        // Note: In a real high-scale app, use RPC or check for race conditions. 
        // For this scale, a direct fetch-update is acceptable or use a postgres function.

        // Fetch current profile with Admin Client to ensure we get data even if RLS is strict
        const { data: profile, error: fetchError } = await adminSupabase
            .from('profiles')
            .select('points, lifetime_points, last_played_at')
            .eq('id', user.id)
            .single()

        if (fetchError || !profile) {
            console.error("Profile Fetch Error (Admin):", fetchError)
            throw new Error('Profile not found')
        }

        // Check Cooldown (24 hours)
        if (profile.last_played_at) {
            const lastPlayed = new Date(profile.last_played_at)
            const now = new Date()
            const diffHours = (now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60)

            // Make sure checking against last_played_at works
            if (diffHours < 24) {
                // Double check if valid date
                if (!isNaN(lastPlayed.getTime())) {
                    return { success: false, error: 'Daily limit reached. Come back tomorrow!' }
                }
            }
        }

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

        revalidatePath('/dashboard', 'layout')
        revalidatePath('/dashboard/arcade')
        revalidatePath('/dashboard/arcade/scratch')
        revalidatePath('/dashboard/arcade/wheel')

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
