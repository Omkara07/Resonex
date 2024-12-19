import { SongQueueContext } from "@/context/SongQueueContext";
import { useContext } from "react";

// Hook for consuming the context
export const useSongQueue = () => {
    const context = useContext(SongQueueContext);
    if (!context) {
        throw new Error("useSongQueue must be used within a SongQueueProvider");
    }
    return context;
};
