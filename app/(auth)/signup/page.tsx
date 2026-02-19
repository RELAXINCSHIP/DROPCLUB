'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function SignupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirm-password') as string

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        const supabase = createClient()

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // For now, redirect to dashboard. In production, check for email verification.
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <Card className="w-full border border-white/10 bg-zinc-900/40 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    Join the Club
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Create an account to start winning today
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" name="confirm-password" type="password" required />
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
        </div >
    )
}
