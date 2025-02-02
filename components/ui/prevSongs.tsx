"use client"
import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { socket } from '@/socketClient/socket';
import { useSession } from 'next-auth/react';
import { useSongQueue } from '@/hooks/UseSongQueue';

interface Song {
    id: string;
    title: string;
    img: string;
}

interface PlayedSongsListProps {
    roomId: string
}

const SongSkeleton = () => (
    <Card className="flex items-center p-2 bg-zinc-800 border-zinc-800">
        {/* Thumbnail Skeleton */}
        <div className="aspect-video w-24 mr-3">
            <div className="bg-zinc-700 animate-pulse h-full w-full" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-grow">
            <div className="h-4 bg-zinc-700 animate-pulse rounded w-3/4 mb-2" />
            <div className="h-3 bg-zinc-700 animate-pulse rounded w-1/2" />
        </div>

        {/* Button Skeleton */}
        <div className="ml-2 h-8 w-8 bg-zinc-700 animate-pulse rounded" />
    </Card>
);

const PlayedSongs = ({
    roomId
}: PlayedSongsListProps) => {
    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState(true)
    const session: any = useSession()
    const { activeStream } = useSongQueue()

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/streams/getPlayedStreams?roomId=' + roomId)
            setSongs(res.data.playedSongs)
        } catch (e) {
            console.error('Failed to fetch played songs:', e)
        } finally {
            setLoading(false)
        }
    }

    const onAddSong = async ({ songId }: { songId: string }) => {
        try {
            const res = await axios.post('/api/streams/getPlayedStreams', { roomId, songId });
            socket.emit('played-streams-update', { roomId, playedStreams: res.data.playedSongs });
            socket.emit("queue-update", { roomId, userId: session?.data?.user?.id })
        }
        catch (e) {
            console.error('Failed to add song:', e)
        }
    }

    useEffect(() => {
        fetchData()

        return () => {
            // Cleanup if needed
        }
    }, [roomId])

    useEffect(() => {
        socket.on('updated-playedStreams', (data: any) => {
            setSongs(data.playedStreams)
        })

        return () => {
            socket.off('updated-playedStreams')
        }
    }, [])

    return (
        <Card className="bg-zinc-900 relative shadow-[0px_10px_30px_rgba(0,0,0,0.5)] md:h-full w-full overflow-y-auto max-md:w-full">
            <CardHeader>
                <CardTitle className="text-white">Played Songs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 overflow-y-auto">
                {loading ? (
                    // Show 3 skeleton items while loading
                    <>
                        <SongSkeleton />
                        <SongSkeleton />
                        <SongSkeleton />
                    </>
                ) : songs.length === 0 ? (
                    <div className="text-zinc-400 text-center py-4">
                        No songs played yet
                    </div>
                ) : (
                    songs.map((song) => (
                        <Card
                            key={song.id}
                            className="flex items-center p-2 bg-zinc-800 border-zinc-800 hover:bg-zinc-900 transition-colors"
                        >
                            {/* Song img */}
                            <div className="aspect-video w-24 mr-3">
                                {song.img ? (
                                    <img
                                        src={song.img}
                                        alt={song.title}
                                        className="object-cover w-full h-full"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="bg-zinc-700 aspect-video text-3xl w-24 font-extrabold flex items-center justify-center text-zinc-500">
                                        {song.title.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Song Details */}
                            <div className="flex-grow">
                                <h3 className="text-sm font-medium text-white truncate max-w-[200px]">
                                    {song.title}
                                </h3>
                                {activeStream?.id === song.id && (
                                    <div className="w-fit px-2 py-1 rounded-full text-xs bg-green-900 text-green-200">
                                        Playing
                                    </div>
                                )}
                            </div>

                            {/* Add Song Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="ml-2 h-8 w-8"
                                onClick={() => onAddSong({ songId: song.id })}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Card>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

export default PlayedSongs;