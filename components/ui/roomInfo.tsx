import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './skeleton';

interface Member {
    id: string;
    name: string;
    image?: string;
}

interface RoomInfoCardProps {
    roomName: string;
    creator: Member;
    members: Member[];
    isLoading: boolean
}

const RoomInfo = ({ roomName, creator, members, isLoading }: RoomInfoCardProps) => {
    return (
        <Card className="w-full bg-zinc-900 text-white overflow-y-auto h-full">
            <CardHeader>
                <CardTitle className="md:text-xl text-lg font-bold">
                    {isLoading ? <Skeleton className='w-40 md:h-6' /> : roomName ?? "Room Name"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 max-md:hidden h-[50%]">
                {/* Creator Section */}
                <div className="space-y-2">
                    <p className="text-sm text-zinc-400">Created by</p>
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <Skeleton className='rounded-full w-8 h-8' />
                        ) : (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={creator?.image} />
                                <AvatarFallback className="bg-zinc-600">
                                    {creator?.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <span className="text-sm font-medium">
                            {isLoading ? <Skeleton className='w-20 h-6' /> : creator?.name}
                        </span>
                    </div>
                </div>

                {/* Members Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-zinc-400" />
                        <div className="text-sm text-zinc-400">
                            {isLoading ? (
                                <Skeleton className='w-40 h-6' />
                            ) : (
                                `${members.length} ${members.length === 1 ? 'Member' : 'Members'}`
                            )}
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="flex flex-col gap-2 pb-2">
                        {isLoading ? (
                            // Show skeletons for member items
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Skeleton className='rounded-full w-6 h-6' />
                                    <Skeleton className='w-20 h-6' />
                                </div>
                            ))
                        ) : (
                            members.map((member) => (
                                <div key={member.id} className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={member.image} />
                                        <AvatarFallback className="bg-zinc-600 text-xs">
                                            {member.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{member.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default RoomInfo;
