import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, prize, image_url, ends_at, entry_cost } = body

    if (!title || !prize || !ends_at) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
        .from('drops')
        .insert({
            title,
            prize,
            image_url: image_url || '/placeholder.jpg',
            ends_at: new Date(ends_at).toISOString(),
            entry_cost: entry_cost || 0,
            entry_count: 0,
        })
        .select()
        .single()

    if (error) {
        console.error('Create drop error:', error)
        return NextResponse.json({ success: false, error: 'Failed to create drop' }, { status: 500 })
    }

    // Log to activity feed
    try {
        await adminSupabase.from('activity_feed').insert({
            user_id: user.id,
            username: 'DROPCLUB',
            event_type: 'drop_new',
            description: `🚨 New drop just went live: ${title}!`,
        })
    } catch (e) {
        // Non-critical
    }

    return NextResponse.json({ success: true, drop: data })
}
