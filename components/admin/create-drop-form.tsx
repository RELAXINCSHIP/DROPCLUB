'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createDrop } from '@/app/actions'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function CreateDropForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [imageUrl, setImageUrl] = useState<string>('')

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            setError(null)
            if (!e.target.files || e.target.files.length === 0) throw new Error('You must select an image.')

            const file = e.target.files[0]
            const formData = new FormData()
            formData.append('file', file)

            // Dynamic import to avoid circular dependency issues if any, though likely safe to import directly 
            // but consistency with other file.
            const { url, error } = await import('@/app/actions').then(mod => mod.uploadImage(formData))

            if (error) throw new Error(error)
            if (url) setImageUrl(url)

        } catch (error: any) {
            setError('Error uploading image: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleCreateDrop = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        const formData = new FormData(e.currentTarget)
        if (imageUrl && !formData.get('image')) formData.set('image', imageUrl)

        const result = await createDrop(formData)

        if (result && result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setSuccess('Drop created successfully!')
            setLoading(false)
            setImageUrl('')
            e.currentTarget.reset()
        }
    }

    return (
        <form onSubmit={handleCreateDrop} className="space-y-4 max-w-2xl">
            <div className="space-y-2">
                <Label htmlFor="title">Drop Title</Label>
                <Input id="title" name="title" placeholder="e.g. Yeezy Boost 350" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="prize">Prize Description</Label>
                <Input id="prize" name="prize" placeholder="e.g. Sneakers size 10" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="image-upload">Drop Image</Label>
                <div className="flex gap-2">
                    <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </div>
                {uploading && <p className="text-xs text-muted-foreground animate-pulse">Uploading...</p>}
                {imageUrl && <div className="mt-2 text-sm text-green-500">✓ Image ready</div>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="image">Image URL (Optional Override)</Label>
                <Input id="image" name="image" placeholder={imageUrl || "/drops/placeholder.jpg"} defaultValue={imageUrl} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">End Date</Label>
                    <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time">End Time</Label>
                    <Input id="time" name="time" type="time" required />
                </div>
            </div>
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            {success && <div className="text-green-500 text-sm font-medium">{success}</div>}
            <Button type="submit" disabled={loading || uploading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Launch Drop
            </Button>
        </form>
    )
}
