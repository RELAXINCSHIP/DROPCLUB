'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog'
import { Trash2, Edit, Loader2, Image as ImageIcon } from 'lucide-react'
import { deleteDrop, updateDrop } from '@/app/actions'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Drop {
    id: number
    title: string
    prize: string
    image_url: string
    ends_at: string
    entry_count: number
    status: string
}

interface DropsTableProps {
    drops: Drop[]
}

export function DropsTable({ drops }: DropsTableProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [editDrop, setEditDrop] = useState<Drop | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [newImageUrl, setNewImageUrl] = useState('')
    const router = useRouter()

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this drop?')) return
        setLoadingId(id)
        await deleteDrop(id)
        setLoadingId(null)
        router.refresh()
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) return

            const file = e.target.files[0]
            const formData = new FormData()
            formData.append('file', file)

            const { url, error } = await import('@/app/actions').then(mod => mod.uploadImage(formData))

            if (error) throw new Error(error)
            if (url) setNewImageUrl(url)

        } catch (error: any) {
            alert('Upload failed: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editDrop) return
        setUploading(true) // reuse loading state

        const formData = new FormData(e.currentTarget)
        if (newImageUrl) {
            formData.set('image', newImageUrl)
        }

        await updateDrop(editDrop.id, formData)

        setUploading(false)
        setEditOpen(false)
        setNewImageUrl('')
        router.refresh()
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Entries</TableHead>
                        <TableHead>Ends At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {drops.map((drop) => (
                        <TableRow key={drop.id}>
                            <TableCell>
                                <div className="w-16 h-10 bg-zinc-800 rounded overflow-hidden relative">
                                    {drop.image_url && (
                                        <img src={drop.image_url} alt={drop.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">{drop.title}</TableCell>
                            <TableCell>{drop.entry_count}</TableCell>
                            <TableCell>{new Date(drop.ends_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => { setEditDrop(drop); setNewImageUrl(drop.image_url); setEditOpen(true); }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(drop.id)} disabled={loadingId === drop.id}>
                                    {loadingId === drop.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Drop</DialogTitle>
                        <DialogDescription>Update drop details.</DialogDescription>
                    </DialogHeader>
                    {editDrop && (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input id="edit-title" name="title" defaultValue={editDrop.title} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-prize">Prize</Label>
                                <Input id="edit-prize" name="prize" defaultValue={editDrop.prize} />
                            </div>
                            <div className="space-y-2">
                                <Label>Update Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-zinc-800 rounded relative overflow-hidden shrink-0">
                                        <img src={newImageUrl || editDrop.image_url} className="w-full h-full object-cover" />
                                    </div>
                                    <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={uploading}>
                                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
