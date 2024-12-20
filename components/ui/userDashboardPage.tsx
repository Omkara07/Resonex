import { DashboardHeader } from '@/components/ui/dashboard-header'
import { YouTubePlayer } from '@/components/ui/youtube-player'
import { SongQueue } from '@/components/ui/song-queue'
import { AddSongForm } from '@/components/ui/add-song-form'
import { ShareButton } from '@/components/ui/share-button'
import SongQueueContextProvider from '@/context/SongQueueContext'
import { getServerSession } from 'next-auth'
import { NEXT_AUTH_CONFIG } from '@/app/lib/auth'
import Redirect from '../Redirect'

export default function UserDashboardPage({ creatorId, canPlay }: { creatorId: string, canPlay: boolean }) {
    const session = getServerSession(NEXT_AUTH_CONFIG)
    return (
        <div className="bg-black text-white h-screen ">
            <Redirect />
            <DashboardHeader />
            <SongQueueContextProvider>
                <main className="container mx-auto md:px-4 md:pt-4 space-y-6">
                    <div className="grid  md:grid-cols-2">
                        <div className='max-md:hidden w-3/4 ml-auto '>
                            <SongQueue creatorId={creatorId} />
                        </div>
                        <div className="space-y-6 md:w-3/4  max-md:p-3 mr-auto">
                            <AddSongForm creatorId={creatorId} />
                            <YouTubePlayer canPlay={canPlay} creatorId={creatorId} />
                            <div className='overflow-auto md:hidden'>
                                <SongQueue creatorId={creatorId} />
                            </div>
                        </div>
                    </div>
                </main>
            </SongQueueContextProvider>
        </div>
    )
}

