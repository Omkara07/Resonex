"use client"

import { useContext, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown, ArrowBigUp, ArrowBigDown } from 'lucide-react'
import axios from "axios";
import { useSession } from 'next-auth/react'
import { SongQueueContext } from '@/context/SongQueueContext'
import { useSongQueue } from '../../hooks/UseSongQueue'
import { Skeleton } from './skeleton'
import { toast } from 'sonner'
import { Song } from '@/context/SongQueueContext'


export function SongQueue({ creatorId }: { creatorId: string }) {
    const session: any = useSession()
    const { queue, setQueue, getStreams } = useSongQueue()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            await getStreams({ creatorId })
            setLoading(false)
        }

        fetchData()
        const interval = setInterval(() => {
            getStreams({ creatorId })
        }, 10 * 1000)
        return () => clearInterval(interval)
    }, [])
    const handleVote = (id: string, haveUpvoted: boolean, userId: string) => {
        setQueue(prevQueue =>
            prevQueue
                .map(song =>
                    song.id === id ? { ...song, upvotes: song.upvotes + (haveUpvoted ? -1 : 1), haveUpvoted: !haveUpvoted } : song
                )
                .sort((a: Song, b: Song) => {
                    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
                    // If upvotes are equal, sort by title alphabetically
                    return a.title.localeCompare(b.title);
                })
        )
        haveUpvoted ? axios.post('/api/streams/downvote', {
            streamId: id,
            userId
        }) :
            axios.post('/api/streams/upvote', {
                streamId: id,
                userId
            })

        haveUpvoted ? toast.success('Downvoted!') : toast.success('Upvoted!')
    }

    return (
        <Card className="bg-gray-950 relative shadow-[0px_10px_30px_rgba(0,0,0,0.5)] max-h-[85vh] h-full overflow-auto max-md:w-full">
            <CardHeader className="">
                <CardTitle className="text-white">Song Queue</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                {
                    loading ?
                        (
                            <div className="space-y-4 w-full flex flex-col">
                                <Skeleton className='p-2'>
                                    <div className="w-full sm:w-2/3 mb-3 sm:mb-0">
                                        <Skeleton className="aspect-video relative sm:w-2/3">
                                        </Skeleton>
                                        <Skeleton className="mt-2 h-7 text-center sm:text-left">
                                        </Skeleton>
                                    </div>
                                </Skeleton>
                                <Skeleton className='p-2'>
                                    <div className="w-full sm:w-2/3 mb-3 sm:mb-0">
                                        <Skeleton className="aspect-video relative sm:w-2/3">
                                        </Skeleton>
                                        <Skeleton className="mt-2 h-7 text-center sm:text-left">
                                        </Skeleton>
                                    </div>
                                </Skeleton>
                                <Skeleton className='p-2'>
                                    <div className="w-full sm:w-2/3 mb-3 sm:mb-0">
                                        <Skeleton className="aspect-video relative sm:w-2/3">
                                        </Skeleton>
                                        <Skeleton className="mt-2 h-7 text-center sm:text-left">
                                        </Skeleton>
                                    </div>
                                </Skeleton>
                            </div>
                        )
                        : queue.length === 0 ?
                            <div className='flex justify-center items-center md:mt-40 max-md:h-40 text-sm '> No songs in the Queue</div> :
                            <ul className="space-y-4">
                                {queue.map(song => (
                                    <li
                                        key={song.id}
                                        className="flex flex-col sm:flex-row max-md:w-full items-center justify-between rounded-lg bg-gray-900 p-3 transition-all hover:bg-gray-800"
                                    >
                                        <div className="w-full sm:w-2/3 mb-3 sm:mb-0">
                                            <div className="aspect-video relative sm:w-2/3">
                                                <img
                                                    src={song.img}
                                                    alt={song.title}
                                                    className="absolute inset-0 w-full aspect-video object-cover rounded"
                                                />
                                            </div>
                                            <div className="mt-2 text-center sm:text-left">
                                                <p className="font-medium text-white">{song.title}</p>
                                                {/* <p className="text-sm text-gray-400">{song.artist}</p> */}
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col items-center space-x-2 sm:space-x-0 sm:space-y-2 w-full sm:w-auto pl-2">
                                            <span className="text-sm text-gray-300 my-2 mx-auto font-bold">{song?.upvotes}</span>
                                            <div className="flex items-center w-full sm:w-auto space-x-2 sm:space-x-0 ">
                                                {
                                                    song.haveUpvoted ?
                                                        <Button
                                                            size="lg"
                                                            variant="outline"
                                                            onClick={() => handleVote(song.id, song.haveUpvoted, session?.data?.user.id)}
                                                            className="flex-1 sm:flex-initial items-center text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                                        >
                                                            <ArrowBigDown className="h-4 w-4" />
                                                            Downvote
                                                        </Button> :
                                                        <Button
                                                            size="lg"
                                                            variant="outline"
                                                            onClick={() => handleVote(song.id, song.haveUpvoted, session?.data?.user.id)}
                                                            className="flex-1 sm:flex-initial items-center text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                                        >
                                                            <ArrowBigUp className="h-4 w-4" />
                                                            Upvote
                                                        </Button>
                                                }
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                }
            </CardContent>
        </Card >
    )
}

