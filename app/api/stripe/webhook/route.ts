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
    const sig = headers().get('stripe-signature') as string

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
        const userId = session.metadata?.supabase_user_id

        if (!userId) {
            return new Response('User ID missing from metadata', { status: 400 })
        }

        // Update user subscription status
        const { error } = await supabase
            .from('profiles')
            .update({ subscription_status: 'active' }) // or 'pro', 'premium' etc.
            .eq('id', userId)

        if (error) {
            console.error('Error updating profile:', error)
            return new Response('Error updating profile', { status: 500 })
        }
    }

    return NextResponse.json({ received: true })
}
