import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { stripe } from '@/utils/stripe'
import { POINT_PACKS } from '@/components/shop/points-shop'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { packId, successUrl, cancelUrl } = await req.json()
        const pack = POINT_PACKS.find((p) => p.id === packId)

        if (!pack) {
            return new NextResponse('Invalid Pack ID', { status: 400 })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: pack.name,
                            description: pack.description,
                            metadata: {
                                packId: pack.id,
                                points: pack.points
                            }
                        },
                        unit_amount: pack.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: user.id,
                packId: pack.id,
                points: pack.points,
                type: 'point_purchase'
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
