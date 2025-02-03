"use client"
import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from '@/hooks/useDebounce';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Card, CardTitle } from './card';

type Props = {
    setUser: any;
};

const DialogBox = ({ setUser }: Props) => {
    const [roomName, setRoomName] = useState<string>("");
    const debounceval = useDebounce(roomName.toLowerCase());
    const [rooms, setRooms] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const session: any = useSession();

    const loadRooms = async ({ userId }: { userId: string }) => {
        if (!debounceval) {
            setRooms(null);
            return;
        }
        try {
            const res = await axios.get(`/api/rooms/searchRoom?roomName=${debounceval}&userId=${userId}`);
            setRooms(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleJoinRoom = async ({ roomId }: { roomId: string }) => {
        try {
            const res = await axios.post('/api/rooms/joinRoom', {
                roomId,
                userId: session?.data?.user?.id
            });

            console.log(res.data);

            setUser((prevUser: any) => ({
                ...prevUser,
                memberOfRooms: [...(prevUser?.memberOfRooms ?? []), res.data.room]
            }));

            setRoomName("");
            setRooms(null);
            setOpen(false);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (!debounceval || !session) return;

        setLoading(true);
        const fetchData = async () => {
            await loadRooms({ userId: session?.data?.user?.id });
            setLoading(false);
        };
        fetchData();
    }, [debounceval, session]);
    console.log(rooms)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-white text-black" onClick={() => setOpen(true)}>
                    Join Room
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-2 shadow-lg w-full max-md:h-screen md:aspect-square flex flex-col gap-4 p-8">
                <DialogHeader>
                    <DialogTitle>Join Room</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex items-start space-x-2 mt-2">
                        <div className="grid flex-1 gap-2">
                            <Input
                                id="roomName"
                                placeholder="Room Name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="">
                        {loading ? (
                            <div className="animate-pulse text-sm">Loading...</div>
                        ) : (
                            <div>
                                {!rooms ? (
                                    <p className="text-sm text-zinc-400">Start typing to see Rooms</p>
                                ) : rooms?.length <= 0 ? (
                                    <p className="text-sm text-zinc-400">No results for '{roomName}'</p>
                                ) : (
                                    <div>
                                        {rooms?.map((room: any) => (
                                            <Card key={room.id} className="flex items-center gap-2 px-5 justify-between py-3">
                                                <CardTitle className="text">
                                                    <h1>{room.name}</h1>
                                                    <div className='font-light text-[12px] py-2 text-gray-400'>Host: <span className='text-gray-300'>{room?.host?.name}</span>,  Members: <span className='text-gray-300'>{room?.members?.length}</span></div>
                                                </CardTitle>
                                                <Button onClick={() => handleJoinRoom({ roomId: room.id })}>
                                                    Join
                                                </Button>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DialogBox;
