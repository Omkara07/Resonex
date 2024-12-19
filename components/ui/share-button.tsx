"use client"

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'

export function ShareButton() {
    const handleShare = () => {
        console.log('Sharing stream...')
    }

    return (
        <Button
            onClick={handleShare}
            className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-full shadow-lg transition-all"
        >
            <Share2 className="mr-2 h-5 w-5" />
            Share Your Stream
        </Button>
    )
}

