'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, User, Shield } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'


export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [debugLoading, setDebugLoading] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const handleManageSubscription = async () => {
        setLoading(true)
        try {
            // In a real app, this would call an API route that creates a Stripe Portal Session
            alert("Stripe Customer Portal would open here.")
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDebugUpgrade = async () => {
        setDebugLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const { error } = await supabase
                .from('profiles')
                .update({ subscription_status: 'active' })
                .eq('id', user.id)

            if (error) throw error

            alert("Success! You are now a Pro Member (Debug Mode). Go to Dashboard to see changes.")
            router.refresh()
        } catch (error: any) {
            alert("Error: " + error.message)
        } finally {
            setDebugLoading(false)
        }
    }

    return (
        <div className="container py-8 max-w-2xl space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Account
                    </CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Signed in as user</p>
                </CardContent>
                <CardFooter>
                    <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Billing
                    </CardTitle>
                    <CardDescription>Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You can cancel your subscription or update your payment method at any time.
                    </p>
                    <Button onClick={handleManageSubscription} disabled={loading} variant="outline" className="w-full sm:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Manage Subscription
                    </Button>
                </CardContent>
            </Card>

            {/* Debug Section for Localhost Testing */}
            <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-500">
                        <Shield className="h-5 w-5" />
                        Developer Debug
                    </CardTitle>
                    <CardDescription>Use this to test "Pro" features since Webhooks don't work on localhost.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleDebugUpgrade} disabled={debugLoading} className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto">
                        {debugLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Force Upgrade to Pro
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
