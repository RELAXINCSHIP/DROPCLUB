import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2023-10-16', // Removed to fix build error
})

export async function POST(request: Request) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(
            { error: 'You must be logged in to subscribe.' },
            { status: 401 }
        )
    }

    const { priceId } = await request.json()

    // Helper to get or create customer
    const getOrCreateCustomer = async (existingId?: string | null): Promise<string> => {
        // If we have an ID, try to use it? No, verify it exists first? 
        // Actually, standard practice is to store it. If it fails, we create new.
        // But here we want a fresh start if the key changed.

        if (existingId) {
            // Verify if it exists in current Stripe env
            try {
                const customer = await stripe.customers.retrieve(existingId)
                if (!customer.deleted) {
                    return existingId
                }
            } catch (e: any) {
                // If error is 'resource_missing', we need a new one.
                console.log("Customer not found in Stripe, creating new one.")
            }
        }

        // Create new customer
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
                supabase_user_id: user.id,
            },
        })

        // Update profile with new ID
        await supabase
            .from('profiles')
            .update({ stripe_customer_id: customer.id })
            .eq('id', user.id)

        return customer.id
    }

    try {
        // 1. Get existing ID from profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        // 2. Resolve final customer ID (checking validity)
        const customerId = await getOrCreateCustomer(profile?.stripe_customer_id)

        // 3. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${request.headers.get('origin')}/dashboard?success=true`,
            cancel_url: `${request.headers.get('origin')}/dashboard?canceled=true`,
            metadata: {
                supabase_user_id: user.id,
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        )
    }
}
