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

    // Check if already entered
    const { data: existingEntry } = await supabase
        .from('entries')
        .select('id')
        .eq('drop_id', dropId)
        .eq('user_id', user.id)
        .single()

    if (existingEntry) {
        return { error: 'You have already entered this drop.' }
    }

    // Insert entry
    const { error: insertError } = await supabase
        .from('entries')
        .insert({ drop_id: dropId, user_id: user.id })

    if (insertError) {
        return { error: 'Failed to enter drop. Please try again.' }
    }

    const { data: drop } = await supabase.from('drops').select('entry_count').eq('id', dropId).single()
    if (drop) {
        await supabase.from('drops').update({ entry_count: (drop.entry_count || 0) + 1 }).eq('id', dropId)
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function createDrop(formData: FormData) {
    // Use Admin Client to bypass RLS policies for insertion
    const supabase = createAdminClient()
    const supabaseAuth = await createClient()

    // Check auth (still want to ensure user is logged in, ideally check for admin flag in profile)
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    const title = formData.get('title') as string
    const prize = formData.get('prize') as string
    const imageUrl = formData.get('image') as string
    const endDate = formData.get('date') as string
    const endTime = formData.get('time') as string

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
        entry_count: 0
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
    // const endDate = formData.get('date') as string
    // const endTime = formData.get('time') as string

    // Only update fields that are present
    const updates: any = {}
    if (title) updates.title = title
    if (prize) updates.prize = prize
    if (imageUrl) updates.image_url = imageUrl

    // Check if we need to update time
    // For simplicity in MVP edit, let's assume we might not edit time, or we do.
    // If date/time are passed, update them.
    // const endsAt = (endDate && endTime) ? new Date(`${endDate}T${endTime}:00`).toISOString() : undefined
    // if (endsAt) updates.ends_at = endsAt

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
