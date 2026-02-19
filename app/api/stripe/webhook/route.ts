import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createAdminClient } from '@/utils/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    const body = await req.text()
    const headerList = await headers()
    const sig = headerList.get('stripe-signature') as string

    let event: Stripe.Event

    try {
        if (!sig || !webhookSecret) return new Response('Webhook secret not found.', { status: 400 })
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    const supabase = createAdminClient()

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        // Retrieve userId from metadata
        const userId = session.metadata?.userId || session.metadata?.supabase_user_id
        const type = session.metadata?.type

        if (!userId) {
            return new Response('User ID missing from metadata', { status: 400 })
        }

        if (type === 'point_purchase') {
            const pointsToAdd = parseInt(session.metadata?.points || '0')

            // 1. Get current points
            const { data: profile } = await supabase.from('profiles').select('points, lifetime_points').eq('id', userId).single()
            if (profile) {
                const newPoints = (profile.points || 0) + pointsToAdd
                const newLifetime = (profile.lifetime_points || 0) + pointsToAdd

                // 2. Update profile
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ points: newPoints, lifetime_points: newLifetime })
                    .eq('id', userId)

                if (updateError) {
                    console.error('Error adding points:', updateError)
                    return new Response('Error adding points', { status: 500 })
                }

                // 3. Log Transaction
                await supabase.from('point_transactions').insert({
                    user_id: userId,
                    amount: pointsToAdd,
                    description: `Purchased ${session.metadata?.packId || 'Points Pack'}`
                })
            }
        } else {
            // Default subscription logic
            const { error } = await supabase
                .from('profiles')
                .update({ subscription_status: 'active' }) // or 'pro', 'premium' etc.
                .eq('id', userId)

            if (error) {
                console.error('Error updating profile:', error)
                return new Response('Error updating profile', { status: 500 })
            }
        }
    }

    return NextResponse.json({ received: true })
}
