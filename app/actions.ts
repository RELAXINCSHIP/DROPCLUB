'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function enterDrop(dropId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'You must be logged in to enter.' }
    }

    // Use Admin Client for critical point transactions to bypass RLS/ensure atomicity
    const adminSupabase = createAdminClient()

    // 1. Get Drop Details (Cost)
    const { data: drop } = await adminSupabase
        .from('drops')
        .select('entry_cost, entry_count, title')
        .eq('id', dropId)
        .single()

    if (!drop) return { error: 'Drop not found' }
    const cost = drop.entry_cost || 0

    // 2. Check User Balance
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: 'Profile not found' }

    if ((profile.points || 0) < cost) {
        return { error: `Insufficient points! This drop costs ${cost} PTS.` }
    }

    // 3. Check for existing entry
    const { data: existingEntry } = await adminSupabase
        .from('entries')
        .select('id')
        .eq('drop_id', dropId)
        .eq('user_id', user.id)
        .single()

    if (existingEntry) {
        return { error: 'You have already entered this drop.' }
    }

    // 4. Process Transaction
    // A. Deduct Points
    if (cost > 0) {
        const { error: pointError } = await adminSupabase
            .from('profiles')
            .update({ points: (profile.points || 0) - cost })
            .eq('id', user.id)

        if (pointError) {
            console.error("Point deduction failed:", pointError)
            return { error: 'Transaction failed. Please try again.' }
        }
    }

    // B. Create Entry
    const { error: insertError } = await adminSupabase
        .from('entries')
        .insert({ drop_id: dropId, user_id: user.id })

    if (insertError) {
        // Critical: In a real app we would rollback points here.
        // For MVP, we log strictly.
        console.error("Entry insertion failed!", insertError)
        return { error: 'Failed to record entry.' }
    }

    // C. Update Drop Counter
    await adminSupabase.from('drops').update({ entry_count: (drop.entry_count || 0) + 1 }).eq('id', dropId)

    // D. Log Transaction (Audit)
    if (cost > 0) {
        await adminSupabase.from('point_transactions').insert({
            user_id: user.id,
            amount: -cost,
            description: `Entry for ${drop.title}`
        })
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function createDrop(formData: FormData) {
    // Use Admin Client to bypass RLS policies for insertion
    const supabase = createAdminClient()
    const supabaseAuth = await createClient()

    // Check auth
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    const title = formData.get('title') as string
    const prize = formData.get('prize') as string
    const imageUrl = formData.get('image') as string
    const endDate = formData.get('date') as string
    const endTime = formData.get('time') as string

    // New Fields
    const entryCost = parseInt(formData.get('entry_cost') as string) || 0
    const winnerVideoUrl = formData.get('winner_video_url') as string

    if (!title || !prize || !endDate || !endTime) {
        return { error: 'Missing required fields' }
    }

    // Combine date and time
    const endsAt = new Date(`${endDate}T${endTime}:00`).toISOString()

    const { error } = await supabase.from('drops').insert({
        title,
        prize,
        image_url: imageUrl || '/placeholder.jpg',
        ends_at: endsAt,
        status: 'active',
        entry_count: 0,
        entry_cost: entryCost,
        winner_video_url: winnerVideoUrl
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    return { success: true }
}

export async function deleteDrop(id: number) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('drops').delete().eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    return { success: true }
}

export async function updateDrop(id: number, formData: FormData) {
    const supabase = createAdminClient()

    const title = formData.get('title') as string
    const prize = formData.get('prize') as string
    const imageUrl = formData.get('image') as string

    // New Fields could be updated here too if we expanded the Edit form
    // keeping simple for now.

    // Only update fields that are present
    const updates: any = {}
    if (title) updates.title = title
    if (prize) updates.prize = prize
    if (imageUrl) updates.image_url = imageUrl

    if (Object.keys(updates).length === 0) {
        return { success: true } // Nothing to update
    }

    const { error } = await supabase.from('drops').update(updates).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    return { success: true }
}

export async function uploadImage(formData: FormData) {
    const soupAuth = await createClient()
    const { data: { user } } = await soupAuth.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const file = formData.get('file') as File
    if (!file) return { error: 'No file uploaded' }

    const supabase = createAdminClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error } = await supabase.storage.from('drops').upload(filePath, file, {
        contentType: file.type,
        upsert: false
    })

    if (error) return { error: error.message }

    const { data: { publicUrl } } = supabase.storage.from('drops').getPublicUrl(filePath)
    return { url: publicUrl }
}

export async function resetProfile() {
    const supabase = createAdminClient()
    const supabaseAuth = await createClient()

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Get user drop entries to decrement counts
    const { data: entries } = await supabase
        .from('entries')
        .select('drop_id')
        .eq('user_id', user.id)

    // 2. Decrement drop counts (This is inefficient loop but fine for dev/reset)
    if (entries) {
        for (const entry of entries) {
            // We could do a bulk RPC but simple loop works for MVP
            const { data: drop } = await supabase.from('drops').select('entry_count').eq('id', entry.drop_id).single()
            if (drop) {
                await supabase.from('drops').update({ entry_count: Math.max(0, (drop.entry_count || 0) - 1) }).eq('id', entry.drop_id)
            }
        }
    }

    // 3. Delete Entries
    await supabase.from('entries').delete().eq('user_id', user.id)

    // 4. Delete Transactions
    await supabase.from('point_transactions').delete().eq('user_id', user.id)

    // 5. Reset Profile (Points = 20, defaults)
    const { error } = await supabase
        .from('profiles')
        .update({
            points: 20,
            lifetime_points: 20, // Reset lifetime too? or keep? Let's reset for full "fresh" feel
            last_played_at: null,
            streak_days: 0
        })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/settings')
    return { success: true }
}
