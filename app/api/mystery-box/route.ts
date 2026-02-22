import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const COST = 100

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // Get user profile
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('points, lifetime_points, display_name, email')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.points || 0) < COST) {
        return NextResponse.json({ success: false, error: 'Not enough points' }, { status: 400 })
    }

    // Get available rewards
    const { data: rewards } = await adminSupabase
        .from('mystery_box_rewards')
        .select('*')
        .eq('active', true)

    if (!rewards || rewards.length === 0) {
        return NextResponse.json({ success: false, error: 'No rewards available' }, { status: 500 })
    }

    // Weighted random selection
    const totalWeight = rewards.reduce((sum: number, r: any) => sum + (r.weight || 1), 0)
    let random = Math.random() * totalWeight
    let selectedReward = rewards[0]

    for (const reward of rewards) {
        if (random < (reward.weight || 1)) {
            selectedReward = reward
            break
        }
        random -= reward.weight || 1
    }

    // Deduct cost & add reward points
    const netChange = (selectedReward.reward_value || 0) - COST
    const newPoints = (profile.points || 0) + netChange
    const newLifetime = (profile.lifetime_points || 0) + Math.max(0, selectedReward.reward_value || 0)

    await adminSupabase
        .from('profiles')
        .update({
            points: newPoints,
            lifetime_points: newLifetime,
        })
        .eq('id', user.id)

    // Log activity
    const username = profile.display_name || profile.email?.split('@')[0] || 'Someone'
    await adminSupabase.from('activity_feed').insert({
        user_id: user.id,
        username,
        event_type: 'mystery_box',
        description: `opened a Mystery Box and got ${selectedReward.icon} ${selectedReward.name}!`,
    })

    return NextResponse.json({
        success: true,
        reward: selectedReward,
        newPoints,
    })
}
