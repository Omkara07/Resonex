import { DashboardHeader } from '@/components/ui/dashboard-header'
import { YouTubePlayer } from '@/components/ui/youtube-player'
import { SongQueue } from '@/components/ui/song-queue'
import { AddSongForm } from '@/components/ui/add-song-form'
import { ShareButton } from '@/components/ui/share-button'
import Redirect from '@/components/Redirect'
import SongQueueContextProvider from '@/context/SongQueueContext'

export default function DashboardPage() {
    return (
        <div className="bg-black text-white h-screen">
            <Redirect />
            <DashboardHeader />
            <SongQueueContextProvider>
                <main className="container mx-auto md:px-4 md:pt-4 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className='max-md:hidden w-3/4 mx-auto'>
                            <SongQueue />
                        </div>
                        <div className="space-y-6 md:w-3/4 max-md:p-3 mx-auto">
                            <AddSongForm />
                            <YouTubePlayer />
                            <div className='overflow-auto md:hidden'>
                                <SongQueue />
                            </div>
                            <div className="flex justify-center">
                                <ShareButton />
                            </div>
                        </div>
                    </div>
                </main>
            </SongQueueContextProvider>
        </div>
    )
}

