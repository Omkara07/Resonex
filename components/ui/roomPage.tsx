"use client"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from "framer-motion";
import axios from 'axios'
import { toast } from 'sonner'
import { socket } from "@/socketClient/socket"

import { YTPlayer } from './YTPlayer'
import { SongQueue } from '@/components/ui/song-queue'
import { AddSongForm } from '@/components/ui/add-song-form'
import SongQueueContextProvider from '@/context/SongQueueContext'
import RoomInfo from './roomInfo'
import PlayedSongs from './prevSongs'
import Redirect from '../Redirect'
import { Card } from './card'

interface Room {
    id: string
    hostId: string
    name: string
    isActive: boolean
    members: any[]
    streams: any[]
    host: any
}

interface RoomPageProps {
    roomId: string
}

export default function RoomPage({ roomId }: RoomPageProps) {
    const { data: session } = useSession() as { data: any }
    const [room, setRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState(true)
    const [queueActive, setQueueActive] = useState(true)

    useEffect(() => {
        if (!session || !roomId) return

        const fetchRoom = async () => {
            try {
                const { data } = await axios.post('/api/rooms/getRoom', { roomId })
                setRoom(data.room)
            } catch (error) {
                console.error("Failed to fetch room:", error)
                toast.error("Failed to join room")
            } finally {
                setLoading(false)
            }
        }

        fetchRoom()
    }, [roomId, session])

    useEffect(() => {
        if (!socket.connected || !session?.user?.name || !roomId || !room?.name) return

        const userName = session.user.name

        socket.emit("join-room", { roomId, userName, roomName: room.name })

        const handleJoinMessage = (message: string) => {
            toast.success(message)
        }

        socket.on("joined-message", handleJoinMessage)

        return () => {
            socket.emit("leave-room", roomId)
            socket.off("joined-message", handleJoinMessage)
        }
    }, [roomId, room?.name, session?.user?.name])

    const isHost = room?.hostId === session?.user?.id

    return (
        <div className="bg-zinc-950 text-white min-h-screen h-full">
            <Redirect />
            <SongQueueContextProvider>
                <main className="container mx-auto px-2 py-8 max-md:p-2">
                    <div className="grid md:grid-cols-7 gap-3">
                        {/* Left Column */}
                        <div className="col-span-2 flex flex-col gap-3 md:h-[88vh]">
                            <div className="h-2/5 overflow-y-auto">
                                <RoomInfo
                                    roomName={room?.name ?? ""}
                                    creator={room?.host}
                                    members={room?.members ?? []}
                                    isLoading={loading}
                                />
                            </div>

                            <div className="md:hidden">
                                <AddSongForm
                                    creatorId={session?.user?.id}
                                    roomId={roomId}
                                />
                            </div>

                            <div className="h-3/5">
                                <YTPlayer
                                    canPlay={isHost}
                                    creatorId={room?.hostId ?? ""}
                                    roomId={roomId}
                                    creator={room?.host}
                                />
                            </div>

                            <div className="md:hidden space-y-2">
                                <Card className='flex justify-between '>
                                    <button onClick={() => setQueueActive(!queueActive)} className={`font-bold w-1/2 ${queueActive ? "bg-zinc-800" : "text-zinc-500"} rounded-s-full`}>Song Queue</button>
                                    <button onClick={() => setQueueActive(!queueActive)} className={`font-bold w-1/2 ${!queueActive ? "bg-zinc-800" : "text-zinc-500"} rounded-e-full`}>Played Songs</button>
                                </Card>
                                <motion.div
                                    key={queueActive ? "queue" : "played"}
                                    initial={{ opacity: 0, x: queueActive ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: queueActive ? 20 : -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {
                                        queueActive ?
                                            <SongQueue
                                                creatorId={room?.hostId ?? ""}
                                                roomId={roomId}
                                            />
                                            :
                                            <PlayedSongs roomId={roomId} />
                                    }
                                </motion.div>
                            </div>
                        </div>

                        {/* Middle Column */}
                        <div className="hidden md:block col-span-3">
                            <SongQueue
                                creatorId={room?.hostId ?? ""}
                                roomId={roomId}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="hidden md:flex col-span-2 flex-col gap-3 h-[85vh]">
                            <div className="h-1/3">
                                <AddSongForm
                                    creatorId={session?.user?.id}
                                    roomId={roomId}
                                />
                            </div>
                            <div className="h-full">
                                <PlayedSongs roomId={roomId} />
                            </div>
                        </div>
                    </div>
                </main>
            </SongQueueContextProvider>
        </div>
    )
}