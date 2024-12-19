"use client"
import axios from "axios";
import { createContext, useContext, useState, ReactNode } from "react";

export interface Song {
    id: string
    title: string
    img: string
    artist: string
    thumbnail: string
    upvotes: number
    extractedId: string
    haveUpvoted: boolean
    userId: string
    played: boolean
    playedTs?: Date
    createdAt: Date
}


interface SongQueueContextType {
    queue: Song[];
    setQueue: React.Dispatch<React.SetStateAction<Song[]>>;
    activeStream: Song | null;
    setActiveStream: React.Dispatch<React.SetStateAction<Song | null>>;
    getStreams: ({ creatorId }: { creatorId: string }) => Promise<void>;
}

export const SongQueueContext = createContext<SongQueueContextType | null>(null);

const SongQueueContextProvider = ({ children }: { children: ReactNode }) => {
    const [queue, setQueue] = useState<Song[]>([])
    const [activeStream, setActiveStream] = useState<Song | null>(null)

    async function getStreams({ creatorId }: { creatorId: string }) {
        try {
            await axios.get('/api/streams?creatorId=' + creatorId)
                .then(res => {
                    const sortedStreams = res.data.streams.sort((a: Song, b: Song) => {
                        if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
                        // If upvotes are equal, sort by title alphabetically
                        return a.title.localeCompare(b.title);
                    }); // Sort streams by upvotes
                    setQueue(sortedStreams); // Update state with sorted streams
                    setActiveStream(res.data.activeStreams.stream || null);
                })
        }
        catch (e) {
            console.log("failed to get streams")
        }
    }
    return (
        <SongQueueContext.Provider value={{ queue, setQueue, getStreams, activeStream, setActiveStream }}>
            {children}
        </SongQueueContext.Provider>
    );
}

export default SongQueueContextProvider
