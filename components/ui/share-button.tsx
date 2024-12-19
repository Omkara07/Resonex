"use client"

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export function ShareButton({ creatorId }: { creatorId: string }) {
    const handleShare = () => {
        const shareLink = `${window.location.hostname}/creator/${creatorId}`;
        navigator.clipboard.writeText(shareLink).then(() => {
            toast.success('Copied to clipboard!')
        }, (e) => {
            toast.error('Failed to copy to clipboard!')
        });
    }

    return (
        <Button
            onClick={handleShare}
            className="bg-white flex hover:bg-gray-200 text-black px-4 py-1.5 rounded-full shadow-lg transition-all"
        >
            <Share2 className="mr-2 " />
            Share Your Stream
        </Button>
    )
}

