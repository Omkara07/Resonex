import { Suspense } from 'react'
import RoomPage from '@/components/ui/roomPage'

export default async function CreatorPage({ params }: { params: any }) {
    const { roomId } = await params

    return (
        <Suspense fallback={<div className="bg-zinc-950 text-white h-screen flex items-center justify-center">
            <div className="animate-pulse text-xl">Loading room...</div>
        </div>}>
            <RoomPage roomId={roomId} />
        </Suspense>
    )
}