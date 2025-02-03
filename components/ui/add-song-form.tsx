"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useSongQueue } from '../../hooks/UseSongQueue'
import { Skeleton } from './skeleton'
import { toast } from 'sonner'
import { ShareButton } from './share-button'
import { socket } from '@/socketClient/socket'

export function AddSongForm({ creatorId, roomId }: { creatorId: string, roomId: string }) {
    const [url, setUrl] = useState('')
    const session: any = useSession()
    const [videoData, setVideoData] = useState<any>(null)
    const { getStreams } = useSongQueue()
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        const f = async () => {
            if (url) {
                setLoading(true)
                const videoId = extractVideoId(url)
                if (videoId) {
                    await fetchVideoMetadata(videoId)
                } else {
                    setVideoData(null)
                }
            } else {
                setVideoData(null)
            }
            setLoading(false)
        }
        f()
    }, [url])

    const extractVideoId = (url: string) => {
        const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

        const match = url.match(ytRegex);

        return match ? match[1] : null;
    }

    const fetchVideoMetadata = async (videoId: string) => {
        try {
            const response = await axios.get(`/api/streams/getVideoMetadata?videoId=${videoId}`)
            console.log(response)
            setVideoData(response.data)
        } catch (error) {
            console.error('Error fetching video metadata:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!extractVideoId(url)) {
            return console.log("Invalid url")
        }
        try {

            await axios.post('/api/streams', {
                creatorId: creatorId,
                url,
                roomId
            })
            socket.emit('queue-update', { roomId })
            setUrl('')
            toast.success("Song added to Queue")
        }
        catch (e) {
            console.log(e)
            toast.error("Failed to add song to Queue")
        }
    }
    return (
        <>
            <Card className="bg-zinc-900 relative overflow-hidden w-full md:mx-auto">
                <CardHeader>
                    <div className='flex justify-between items-center w-full'>
                        <CardTitle className="text-white flex">Add a Song</CardTitle>
                        <ShareButton roomId={roomId} creatorId={creatorId} />
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                        <Input
                            type="url"
                            placeholder="Paste YouTube URL here"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-grow bg-zinc-700 focus:bg-zinc-800 text-white placeholder-zinc-400  focus:border-zinc-300 focus:ring-zinc-300"
                        />
                        <Button type="submit" className="bg-zinc-400 hover:bg-zinc-200 text-black ">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </form>
                </CardContent >
            </Card >
            {url && (
                <div className='w-full md:w-[80%] mx-auto -top-8 relative justify-center'>
                    <div className="absolute z-10 md:w-2/3 mx-auto w-full aspect-video bg-zinc-800 p-4 rounded-md shadow-md ">
                        {
                            loading ?
                                (
                                    <div className="text-white w-full flex flex-col items-center gap-5">
                                        <Skeleton className="w-full h-6" />
                                        <Skeleton className="w-full h-40" />
                                    </div>
                                ) :
                                videoData ?
                                    (
                                        <div className="text-white">
                                            <h3 className="font-bold text-lg mb-2">{videoData.title}</h3>
                                            <img
                                                src={videoData.thumbnail.url}
                                                alt={videoData.title}
                                                className="w-full rounded aspect-video"
                                            />
                                        </div>
                                    )
                                    : (
                                        <div className='flex justify-center items-center my-auto text-sm mt-16'>Invalid URL</div>
                                    )
                        }
                    </div>
                </div>
            )}
        </>
    )
}

