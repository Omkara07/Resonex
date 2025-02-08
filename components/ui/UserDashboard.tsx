"use client"
import React, { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Home, Users, User, Trash2, LogOut } from "lucide-react";
import { DashboardHeader } from './dashboard-header';
import axios from 'axios';
import { Button } from './button';
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation';
import DialogBox from './DialogBox';
import { useSession } from 'next-auth/react';
import { Skeleton } from './skeleton';

type userType = {
    id: string,
    email: string,
    name: string,
    image: string,
    hostedRooms: any[],
    memberOfRooms: any[]
}

const ProfileSkeleton = () => (
    <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="text-center space-y-2 w-full">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            <Separator className="bg-zinc-800" />
            <div className="w-full space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
        </CardContent>
    </Card>
);

const RoomCardSkeleton = () => (
    <Card className="bg-zinc-800 border-zinc-700">
        <CardContent className="p-4">
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-4 items-center">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-6" />
                </div>
            </div>
        </CardContent>
    </Card>
);

const RoomsSkeleton = ({ title }: { title: string }) => (
    <Card className="bg-zinc-900 border-zinc-700 md:h-1/2">
        <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
                {title === "Hosted" ? <Home className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                {title === "Hosted" ? "Rooms You Host" : "Rooms You're In"}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4">
                {[1, 2].map((i) => (
                    <RoomCardSkeleton key={i} />
                ))}
            </div>
        </CardContent>
    </Card>
);

const UserDashboard = () => {
    const [user, setUser] = useState<userType | null>(null)
    const [roomName, setRoomName] = useState<string>('');
    const [addRoom, setAddRoom] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()
    const session: any = useSession()

    useEffect(() => {
        getUser();
    }, [])

    const getUser = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/api/auth/getUser');
            console.log(response.data)
            setUser(response.data.user);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
        finally {
            setLoading(false)
        }
    }

    const handleAddRoom = async () => {
        setAddRoom(false);
        const res = await axios.post('/api/rooms/createRoom', { hostId: user?.id, name: roomName.toLowerCase() });
        setUser(prevUser => ({
            ...prevUser,
            hostedRooms: [...(prevUser?.hostedRooms ?? []), res.data.room],
            id: prevUser?.id ?? '',  // Ensure id is always a string
            email: prevUser?.email ?? '',
            name: prevUser?.name ?? '',
            image: prevUser?.image ?? '',
            memberOfRooms: prevUser?.memberOfRooms ?? []
        }));
        setRoomName('');
    }

    const handleLink = (roomId: string) => {
        if (typeof window !== 'undefined') {
            router.push(`/room/${roomId}`);
        }
    };

    const handleDeleteRoom = async ({ roomId }: { roomId: string }) => {
        try {
            setUser(prevUser => ({
                ...prevUser,
                hostedRooms: prevUser?.hostedRooms ? prevUser?.hostedRooms?.filter((room: any) => room.id !== roomId) : [],
                id: prevUser?.id ?? '',
                email: prevUser?.email ?? '',
                name: prevUser?.name ?? '',
                image: prevUser?.image ?? '',
                memberOfRooms: prevUser?.memberOfRooms ?? []
            }));
            const res = await axios.post('/api/rooms/deleteRoom', { roomId });
        }
        catch (e) {
            console.log(e)
        }

    }

    const handleLeaveRoom = async ({ roomId }: { roomId: string }) => {
        try {
            setUser((prevUser: any) => ({
                ...prevUser,
                hostedRooms: prevUser?.hostedRooms ?? [],
                id: prevUser?.id ?? '',
                email: prevUser?.email ?? '',
                name: prevUser?.name ?? '',
                image: prevUser?.image ?? '',
                memberOfRooms: prevUser?.memberOfRooms ? prevUser?.memberOfRooms?.filter((room: any) => room.id !== roomId) : []
            }));
            const res = await axios.post('/api/rooms/exitRoom', { roomId, userId: session?.data?.user?.id })
            console.log(res.data)
            setRoomName('');
        }
        catch (e) {
            console.log(e)
        }
    }
    console.log(user)
    return (
        <div>
            <DashboardHeader />
            <div className="flex max-md:flex-col min-h-screen bg-zinc-950 md:p-6 p-3 gap-6 md:pt-16 pt-20">
                {/* Left Sidebar */}
                <div className="md:w-1/4 space-y-3 md:pt-5">
                    {loading ? (
                        <ProfileSkeleton />
                    ) : (
                        <Card className="bg-zinc-900 border-zinc-700">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-white">Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center space-y-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user?.image} alt={user?.name} />
                                    <AvatarFallback className="bg-zinc-800">
                                        <User className="h-12 w-12 text-zinc-400" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-center">
                                    <h3 className="font-medium text-lg text-white">{user?.name}</h3>
                                    <p className="text-sm text-zinc-400">{user?.email}</p>
                                </div>
                                <Separator className="bg-zinc-800" />
                                <div className="w-full space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Home className="h-4 w-4" />
                                        <span>Hosting {user?.hostedRooms?.length ?? "No"} rooms</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Users className="h-4 w-4" />
                                        <span>Member of {user?.memberOfRooms?.length ?? "No"} rooms</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                    }
                </div>

                {/* Right Content */}
                <div className="flex-1 space-y-4 md:p-2">
                    {loading ? (
                        <>
                            <RoomsSkeleton title="Hosted" />
                            <RoomsSkeleton title="Member" />
                        </>
                    ) : (
                        <>
                            {/* Hosted Rooms */}
                            <Card className="bg-zinc-900 border-zinc-700 md:h-1/2 overflow-y-auto">
                                <CardHeader className='flex justify-between items-center'>
                                    <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
                                        <Home className="h-5 w-5" />
                                        Rooms You Host
                                    </CardTitle>
                                    <div>
                                        {
                                            user && user?.hostedRooms?.length < 3 && (
                                                <Button className={`font-bold text-xl p-4 trasition duration-300`} onClick={() => setAddRoom((prev) => !prev)}>
                                                    <div className={`inline-block transform transition-transform duration-300 ${addRoom ? "rotate-45 scale-125" : ""}`}>+</div>
                                                </Button>
                                            )
                                        }
                                    </div>
                                </CardHeader>
                                {
                                    addRoom && (
                                        <div className='flex justify-center items-center w-full py-2'>
                                            <div className="flex max-md:flex-col gap-4 md:w-2/3">
                                                <Input className='md:w-2/3 bg-zinc-950' placeholder="Room Name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                                                <div className='flex gap-4 max-md:justify-between'>
                                                    <Button onClick={handleAddRoom}>Create Room</Button>
                                                    <Button onClick={() => setAddRoom(false)}>Cancel</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                <CardContent className="h-[calc(100%_-_4rem)] overflow-y-auto">
                                    {
                                        user?.hostedRooms?.length === 0 ? <div>
                                            {!addRoom && <p className="text-sm text-zinc-400">You have not hosted any rooms.</p>}
                                        </div>
                                            :
                                            <div className="grid gap-4 overflow-y-auto">
                                                {user?.hostedRooms?.map((room: any) => (
                                                    <Card key={room?.id} className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 transition-colors">
                                                        <CardContent className="p-4">
                                                            <div className="flex justify-between items-center">
                                                                <div className='cursor-pointer' onClick={() => handleLink(room?.id)}>
                                                                    <h3 className="font-medium text-white">{room?.name}</h3>
                                                                    <p className="text-sm text-zinc-400">{room?.members?.length ? room?.members?.length : 0} {room?.members?.length === 1 ? "member" : "members"}</p>
                                                                </div>
                                                                <div className='flex gap-4 items-center'>
                                                                    <div className={`px-2 py-1 rounded-full text-xs ${room?.isActive
                                                                        ? 'bg-green-900 text-green-200'
                                                                        : 'bg-zinc-700 text-zinc-300'
                                                                        }`}>
                                                                        {room?.isActive ? 'Active' : 'Inactive'}
                                                                    </div>
                                                                    <button onClick={() => handleDeleteRoom({ roomId: room?.id })}><Trash2 /></button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                    }
                                </CardContent>
                            </Card>

                            {/* Member Rooms */}
                            <Card className="bg-zinc-900 border-zinc-700 md:h-1/2 overflow-y-auto">
                                <CardHeader className='flex justify-between items-center'>
                                    <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
                                        <Users className="h-5 w-5" />
                                        Rooms You're In
                                    </CardTitle>
                                    <div>
                                        {
                                            user && user?.memberOfRooms?.length < 3 && (
                                                <DialogBox setUser={setUser} />
                                            )
                                        }
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {
                                        user && user?.memberOfRooms?.length === 0 ? (
                                            <p className="text-sm text-zinc-400">You are not member of any rooms.</p>
                                        )
                                            :
                                            <div className="grid gap-4">
                                                {user?.memberOfRooms?.map((room: any) => (
                                                    <Card key={room?.id} className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 transition-colors">
                                                        <CardContent className="p-4">
                                                            <div className="flex justify-between items-center">
                                                                <div className='cursor-pointer' onClick={() => handleLink(room?.id)}>
                                                                    <h3 className="font-medium text-white">{room?.name}</h3>
                                                                    <p className="text-sm text-zinc-400">{room?.members?.length ? room?.members?.length : 0} {room?.members?.length === 1 ? "member" : "members"}</p>
                                                                </div>
                                                                <div className='flex gap-4 items-center'>
                                                                    <div className={`px-2 py-1 rounded-full text-xs ${room.isActive
                                                                        ? 'bg-green-900 text-green-200'
                                                                        : 'bg-zinc-700 text-zinc-300'
                                                                        }`}>
                                                                        {room?.isActive ? 'Active' : 'Inactive'}
                                                                    </div>
                                                                    <button onClick={() => handleLeaveRoom({ roomId: room?.id })}><LogOut /></button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                    }
                                </CardContent>
                            </Card>
                        </>
                    )
                    }
                </div>
            </div>
        </div >
    );
};

export default UserDashboard;