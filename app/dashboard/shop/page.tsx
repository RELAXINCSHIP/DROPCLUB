import { PointsShop } from '@/components/shop/points-shop'

export const dynamic = 'force-dynamic'

export default function ShopPage() {
    return (
        <div className="container mx-auto max-w-5xl py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Points Shop</h1>
                <p className="text-muted-foreground">Top up your balance to enter more drops.</p>
            </div>

            <PointsShop />
        </div>
    )
}
