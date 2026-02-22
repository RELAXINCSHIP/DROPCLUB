'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Log activity to feed
export async function logActivity(
    event_type: string,
    description: string,
    userId?: string,
    username?: string
) {
    const adminSupabase = createAdminClient()

    await adminSupabase.from('activity_feed').insert({
        user_id: userId,
        username: username || 'Someone',
        event_type,
        description,
    })
}

// Check and update daily login streak
export async function checkLoginStreak() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const adminSupabase = createAdminClient()

    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('login_streak, last_login_date, points, lifetime_points, display_name, email')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    const today = new Date().toISOString().split('T')[0]

    // Already logged in today
    if (profile.last_login_date === today) {
        return { streak: profile.login_streak || 0, bonus: 0, alreadyClaimed: true }
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    let newStreak = 1

    if (profile.last_login_date === yesterday) {
        // Consecutive day
        newStreak = (profile.login_streak || 0) + 1
    }
    // else streak resets to 1

    // Calculate streak bonus
    let bonus = 0
    if (newStreak >= 30) bonus = 100
    else if (newStreak >= 7) bonus = 20
    else if (newStreak >= 3) bonus = 5

    const newPoints = (profile.points || 0) + bonus
    const newLifetime = (profile.lifetime_points || 0) + bonus

    await adminSupabase
        .from('profiles')
        .update({
            login_streak: newStreak,
            last_login_date: today,
            points: newPoints,
            lifetime_points: newLifetime,
        })
        .eq('id', user.id)

    // Log activity if streak milestone
    if (newStreak === 3 || newStreak === 7 || newStreak === 30) {
        const username = profile.display_name || profile.email?.split('@')[0] || 'Someone'
        await logActivity('achievement', `hit a ${newStreak}-day login streak! 🔥`, user.id, username)
    }

    return { streak: newStreak, bonus, alreadyClaimed: false }
}

// Generate or get referral code
export async function getReferralCode() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const adminSupabase = createAdminClient()

    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single()

    if (profile?.referral_code) return profile.referral_code

    // Generate new code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()

    await adminSupabase
        .from('profiles')
        .update({ referral_code: code })
        .eq('id', user.id)

    return code
}

// Apply referral code on signup
export async function applyReferralCode(code: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not logged in' }

    const adminSupabase = createAdminClient()

    // Find referrer
    const { data: referrer } = await adminSupabase
        .from('profiles')
        .select('id, points, lifetime_points, display_name, email')
        .eq('referral_code', code.toUpperCase())
        .single()

    if (!referrer) return { success: false, error: 'Invalid referral code' }
    if (referrer.id === user.id) return { success: false, error: "Can't refer yourself!" }

    // Check if already referred
    const { data: existing } = await adminSupabase
        .from('referrals')
        .select('id')
        .eq('referee_id', user.id)
        .single()

    if (existing) return { success: false, error: 'Already used a referral code' }

    // Create referral record
    await adminSupabase.from('referrals').insert({
        referrer_id: referrer.id,
        referee_id: user.id,
        points_awarded: true,
    })

    // Award 50 PTS to both
    await adminSupabase
        .from('profiles')
        .update({
            points: (referrer.points || 0) + 50,
            lifetime_points: (referrer.lifetime_points || 0) + 50,
            referred_by: referrer.id,
        })
        .eq('id', referrer.id)

    const { data: userProfile } = await adminSupabase
        .from('profiles')
        .select('points, lifetime_points')
        .eq('id', user.id)
        .single()

    await adminSupabase
        .from('profiles')
        .update({
            points: (userProfile?.points || 0) + 50,
            lifetime_points: (userProfile?.lifetime_points || 0) + 50,
            referred_by: referrer.id,
        })
        .eq('id', user.id)

    // Log activity
    const referrerName = referrer.display_name || referrer.email?.split('@')[0] || 'Someone'
    await logActivity('signup', `was referred by ${referrerName} (+50 PTS each!)`, user.id, 'A new member')

    return { success: true }
}
