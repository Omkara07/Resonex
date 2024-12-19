"use client"
import axios from "axios";
import { createContext, useContext, useState, ReactNode } from "react";

interface Song {
    id: string
    title: string
    img: string
    artist: string
    thumbnail: string
    upvotes: number
    haveUpvoted: boolean
    userId: string
}


interface SongQueueContextType {
    queue: Song[];
    setQueue: React.Dispatch<React.SetStateAction<Song[]>>;
    getStreams: () => Promise<void>;
}

export const SongQueueContext = createContext<SongQueueContextType | null>(null);

const SongQueueContextProvider = ({ children }: { children: ReactNode }) => {
    const [queue, setQueue] = useState<Song[]>([])

    async function getStreams() {
        try {

            await axios.get('/api/streams/myStreams')
                .then(res => {
                    console.log(res.data)
                    const sortedStreams = res.data.streams.sort((a: Song, b: Song) => b.upvotes - a.upvotes); // Sort streams by upvotes
                    setQueue(sortedStreams); // Update state with sorted streams
                })
        }
        catch (e) {
            console.log("failed to get streams")
        }
    }
    return (
        <SongQueueContext.Provider value={{ queue, setQueue, getStreams }}>
            {children}
        </SongQueueContext.Provider>
    );
}

export default SongQueueContextProvider
