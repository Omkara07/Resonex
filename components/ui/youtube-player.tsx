"use client"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from './button'
import { ChevronLast } from 'lucide-react';
import { useSongQueue } from '@/hooks/UseSongQueue';
import { Song } from "@/context/SongQueueContext";
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from './skeleton';
import { useSession } from 'next-auth/react';
export function YouTubePlayer({ canPlay, creatorId }: { canPlay: boolean, creatorId: string }) {
    const { activeStream, setActiveStream, getStreams }: {
        activeStream: Song | null, setActiveStream: React.Dispatch<React.SetStateAction<Song | null>>, getStreams: ({ creatorId }: { creatorId: string }) => Promise<void>;
    } = useSongQueue();

    const session: any = useSession();
    const [loading, setLoading] = useState<boolean>(false)

    const handleNext = async () => {
        setLoading(true)
        await axios.get('/api/streams/next')
            .then(async (res) => {
                if (res.data.stream) {
                    setActiveStream(res.data.stream)
                    await getStreams({ creatorId })
                }
                setLoading(false)
            })
            .catch((e) => {
                setActiveStream(null)
                console.log(e)
                setLoading(false)
            })
    }


    return (
        <Card className="overflow-hidden bg-gray-950 relative md:w-[80%] md:mx-auto">
            <CardContent className="p-0">
                {
                    loading ? (
                        <div>

                            <Skeleton className="aspect-video bg-gray-900" />
                            <div className="p-4 flex justify-between">
                                <Skeleton className="text-lg font-semibold text-white" />
                            </div>
                        </div>
                    ) :
                        <>
                            <div className="aspect-video bg-gray-800">
                                {
                                    activeStream ?
                                        <iframe height="100%" width={"100%"} src={`https://www.youtube.com/embed/${activeStream.extractedId}?autoplay=1&${creatorId === session?.data?.user?.id ? '' : 'controls=0'}&modestbranding=1&rel=0&showinfo=0`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                        :
                                        <div className='bg-gray-900 flex justify-center items-center h-full'>No Active Stream</div>
                                }
                            </div>
                            <div className="p-4 flex justify-between">
                                {
                                    activeStream ?
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">{activeStream.title}</h2>
                                        </div> :
                                        <div className="text-lg font-semibold text-white">No Active Stream</div>
                                }
                                {canPlay && <Button onClick={handleNext}>Play Next<ChevronLast size={96} className="w-4 h-4 text-xl" /></Button>}
                            </div>
                        </>
                }
            </CardContent>
        </Card >
    )
}

