import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminStats } from '@/components/admin/admin-stats'
import { DropsTable } from '@/components/admin/drops-table'
import { UsersTable } from '@/components/admin/users-table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CreateDropForm } from '@/components/admin/create-drop-form'

// We need to extract the Create form into a component or just keep it here if it's small enough.
// Since I'm rewriting the page, I'll inline the create form logic or fetch it from previous file if I want to be cleaner.
// Actually, let's just make the create form a client component to avoid server/client mixing issues in this server page.

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Parallel data fetching
    const [dropsRes, usersRes, entriesRes] = await Promise.all([
        supabase.from('drops').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('entries').select('id', { count: 'exact' }),
    ])

    const drops = dropsRes.data || []
    const users = usersRes.data || []
    const totalEntries = entriesRes.count || 0
    const activeDrops = drops.filter(d => d.status === 'active' && new Date(d.ends_at) > new Date()).length

    return (
        <div className="container py-8 max-w-7xl space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
                    <p className="text-muted-foreground">Manage drops, track users, and oversee the club.</p>
                </div>
            </div>

            <AdminStats
                userCount={users.length}
                activeDropCount={activeDrops}
                totalEntries={totalEntries}
            />

            <Tabs defaultValue="drops" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="drops">Drops</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
                <TabsContent value="drops" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Drop Management</CardTitle>
                            <CardDescription>View, edit, or delete drops. (Use Edit to fix broken images)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DropsTable drops={drops} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Launch New Drop</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CreateDropForm />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Roster</CardTitle>
                            <CardDescription>All registered members.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UsersTable users={users} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
