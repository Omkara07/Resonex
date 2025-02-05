"use client"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from './button'
import { ChevronLast, Play, Pause } from 'lucide-react';
import { useSongQueue } from '@/hooks/UseSongQueue';
import { Song } from "@/context/SongQueueContext";
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from './skeleton';
import { useSession } from 'next-auth/react';
import { socket } from '@/socketClient/socket';
import { toast } from 'sonner';

// Types
declare global {
    interface Window {
        YT: {
            Player: new (
                element: string | HTMLElement,
                config: {
                    videoId?: string;
                    playerVars?: {
                        autoplay?: 0 | 1;
                        controls?: 0 | 1;
                        mute?: 0 | 1;
                        modestbranding?: 0 | 1;
                        rel?: 0 | 1;
                        showinfo?: 0 | 1;
                    };
                    width?: string;
                    height?: string;
                    events?: {
                        onReady?: (event: any) => void;
                        onStateChange?: (event: any) => void;
                        onError?: (event: any) => void;
                    };
                }
            ) => any;
            PlayerState: {
                ENDED: 0;
                PLAYING: 1;
                PAUSED: 2;
                BUFFERING: 3;
                CUED: 5;
            };
        };
        onYouTubeIframeAPIReady: () => void;
    }
}

interface PlayerCommand {
    type: 'play' | 'pause' | 'seek' | 'buffer' | 'ready';
    timestamp?: number;
    videoTime?: number;
}

interface YouTubePlayerProps {
    canPlay: boolean;
    creatorId: string;
    roomId: string;
    creator: any;
}

export function YTPlayer({ canPlay, creatorId, roomId, creator }: YouTubePlayerProps) {
    const { activeStream, setActiveStream } = useSongQueue();
    const session: any = useSession();
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [clientsReady, setClientsReady] = useState(new Set<string>());
    const [initialSyncDone, setInitialSyncDone] = useState(false);

    const isHost = creatorId === session?.data?.user?.id;

    // to ref to the player div element
    const playerContainerRef = useRef<HTMLDivElement>(null);
    // ref to actual player inside the ref (used for destroying the player)
    const playerInstanceRef = useRef<any>(null);
    // all the 3 are used as variables to prevent DOM node issues
    // this one is used to provide a debounce effect when changing the video to ensure multiple clicks on playnext
    const stateChangeHandled = useRef<boolean>(false);
    // YT iframe script is loaded or not
    const scriptLoadedRef = useRef(false);
    // player instance is created or not
    const playerInitializedRef = useRef(false);

    const destroyPlayer = () => {
        if (playerInstanceRef.current) {
            const playerElement = document.getElementById('youtube-player');
            if (playerElement) {
                playerElement.remove();
            }

            try {
                playerInstanceRef.current.destroy();
            } catch (error) {
                console.error('Error destroying player:', error);
            } finally {
                playerInstanceRef.current = null;
                playerInitializedRef.current = false;
            }
        }
    };

    const sendCommand = (command: PlayerCommand) => {
        if (!isHost) return;
        socket.emit('player-command', { roomId, command });
    };

    const handleCommand = async (command: PlayerCommand) => {
        if (!playerInstanceRef.current || isHost) return;

        switch (command.type) {
            case 'play':
                await playerInstanceRef.current.playVideo();
                if (command.videoTime) {
                    await playerInstanceRef.current.seekTo(command.videoTime, true);
                }
                setIsPlaying(true);
                setIsBuffering(false);
                break;
            case 'pause':
                await playerInstanceRef.current.pauseVideo();
                setIsPlaying(false);
                setIsBuffering(false);
                break;
            case 'seek':
                if (command.videoTime) {
                    await playerInstanceRef.current.seekTo(command.videoTime, true);
                }
                break;
            case 'buffer':
                setIsBuffering(true);
                if (command.videoTime) {
                    await playerInstanceRef.current.seekTo(command.videoTime, true);
                }
                break;
            case 'ready':
                socket.emit('client-ready', { roomId, userId: session?.data?.user?.id });
                break;
        }
    };

    const handlePlayPause = async () => {
        if (!isHost || !playerInstanceRef.current) return;

        const currentTime = await playerInstanceRef.current.getCurrentTime();
        if (isPlaying) {
            sendCommand({ type: 'pause', timestamp: Date.now() });
            await playerInstanceRef.current.pauseVideo();
        } else {
            sendCommand({ type: 'play', timestamp: Date.now(), videoTime: currentTime });
            await playerInstanceRef.current.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    const handleNext = async () => {
        // Guard clauses
        if (loading || stateChangeHandled.current || !isHost) return;

        stateChangeHandled.current = true;
        setLoading(true);

        try {
            // First pause the current video if it's playing
            if (playerInstanceRef.current) {
                try {
                    await playerInstanceRef.current.pauseVideo();
                    setIsPlaying(false);
                } catch (error) {
                    console.error('Error pausing video:', error);
                }
            }

            // Destroy player with proper error handling
            try {
                destroyPlayer();
            } catch (error) {
                console.error('Error destroying player:', error);
                // Continue execution even if destroy fails
            }

            // Fetch next stream
            const res = await axios.get('/api/streams/next?roomId=' + roomId);

            if (res.data.stream) {

                if (res.data.stream) {
                    socket.emit('curStream-update', { roomId, curStream: res.data.stream });
                    socket.emit("queue-update", { roomId });
                    socket.emit("get-updated-played-streams", { roomId });
                } else {
                    toast.error('No more songs in queue');
                    setActiveStream(null);
                }

                // Wait a brief moment for clients to process the stream update
                await new Promise(resolve => setTimeout(resolve, 100));

                // Send play command
                sendCommand({
                    type: 'play',
                    timestamp: Date.now(),
                    videoTime: 0 // Start from beginning of new video
                });

                setIsPlaying(true);
                setIsBuffering(false);
            } else {
                toast.error('No more songs in queue');
                setActiveStream(null);
            }
        } catch (error) {
            console.error('Error in handleNext:', error);
            toast.error("Error fetching next stream");
            setActiveStream(null);
        } finally {
            setLoading(false);
            // Reset debounce after a delay
            setTimeout(() => {
                stateChangeHandled.current = false;
            }, 1000);
        }
    };

    const initializePlayer = () => {
        if (!activeStream?.extractedId || !playerContainerRef.current || playerInitializedRef.current) return;

        // Create a new container for the player
        const playerElement = document.createElement('div');
        playerElement.id = 'youtube-player';
        playerContainerRef.current.appendChild(playerElement);

        playerInitializedRef.current = true;

        try {
            playerInstanceRef.current = new window.YT.Player('youtube-player', {
                videoId: activeStream.extractedId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                },
                width: '100%',
                height: '100%',
                events: {
                    onReady: async (event) => {
                        console.log('Player ready');
                        if (isHost) {
                            sendCommand({ type: 'ready' });
                            const currentTime = await event.target.getCurrentTime();
                            const playerState = await event.target.getPlayerState();
                            socket.emit('host-player-state', {
                                roomId,
                                state: {
                                    isPlaying: playerState === window.YT.PlayerState.PLAYING,
                                    currentTime,
                                    videoId: activeStream.extractedId
                                }
                            });
                        } else {
                            socket.emit('client-ready', { roomId, userId: session?.data?.user?.id });
                            socket.emit('request-initial-state', { roomId });
                        }
                    },
                    onStateChange: async (event) => {
                        if (isHost) {
                            switch (event.data) {
                                case window.YT.PlayerState.PLAYING:
                                    setIsPlaying(true);
                                    setIsBuffering(false);
                                    break;
                                case window.YT.PlayerState.PAUSED:
                                    setIsPlaying(false);
                                    setIsBuffering(false);
                                    break;
                                case window.YT.PlayerState.BUFFERING:
                                    setIsBuffering(true);
                                    sendCommand({
                                        type: 'buffer',
                                        timestamp: Date.now(),
                                        videoTime: await playerInstanceRef.current.getCurrentTime()
                                    });
                                    break;
                                case window.YT.PlayerState.ENDED:
                                    if (!loading && !stateChangeHandled.current) {
                                        handleNext();
                                    }
                                    break;
                            }
                        }
                    },
                    onError: (event) => {
                        console.error('YouTube player error:', event.data);
                        toast.error('Error playing video');
                        if (!loading && !stateChangeHandled.current) {
                            handleNext();
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing player:', error);
            toast.error('Failed to initialize player');
            playerInitializedRef.current = false;
        }
    };

    useEffect(() => {
        socket.on('player-command', ({ command }: any) => handleCommand(command));
        socket.on('client-ready', ({ userId }: any) => {
            setClientsReady(prev => new Set(prev).add(userId));
            if (userId !== session?.data?.user?.id) {
                handleCommand({ type: 'ready' });
            }
        });

        socket.on('joined-message', (message: string) => {
            sendCommand({ type: 'ready' });
        });

        return () => {
            socket.off('player-command');
            socket.off('client-ready');
        };
    }, []);

    useEffect(() => {
        if (session?.data?.user?.id) {
            socket.emit('client-ready', { roomId, userId: session?.data?.user?.id });
        }
    }, [session?.data?.user?.id, roomId]);

    useEffect(() => {
        const loadYouTubeAPI = () => {
            if (!window.YT && !scriptLoadedRef.current) {
                scriptLoadedRef.current = true;
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                if (firstScriptTag.parentNode) {
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                }
            }
        };

        loadYouTubeAPI();

        const checkReadyState = setInterval(() => {
            if (window.YT && window.YT.Player && playerContainerRef.current && !playerInitializedRef.current) {
                clearInterval(checkReadyState);
                initializePlayer();
            }
        }, 100);

        return () => {
            clearInterval(checkReadyState);
            destroyPlayer();
        };
    }, [activeStream?.extractedId, isHost, loading]);

    // Add new useEffect for handling initial sync
    useEffect(() => {
        const handleHostState = async ({ state }: { state: { isPlaying: boolean; currentTime: number; videoId: string } }) => {
            if (isHost || !playerInstanceRef.current || initialSyncDone) return;

            try {
                // Sync with host's state
                await playerInstanceRef.current.seekTo(state.currentTime, true);
                if (state.isPlaying) {
                    await playerInstanceRef.current.playVideo();
                } else {
                    await playerInstanceRef.current.pauseVideo();
                }
                setInitialSyncDone(true);
            } catch (error) {
                console.error('Error syncing with host state:', error);
            }
        };

        const handleStateRequest = async () => {
            if (!isHost || !playerInstanceRef.current) return;

            try {
                const currentTime = await playerInstanceRef.current.getCurrentTime();
                const playerState = await playerInstanceRef.current.getPlayerState();

                socket.emit('host-player-state', {
                    roomId,
                    state: {
                        isPlaying: playerState === window.YT.PlayerState.PLAYING,
                        currentTime,
                        videoId: activeStream?.extractedId
                    }
                });
            } catch (error) {
                console.error('Error getting host state:', error);
            }
        };

        socket.on('host-player-state', handleHostState);
        socket.on('request-initial-state', handleStateRequest);

        return () => {
            socket.off('host-player-state', handleHostState);
            socket.off('request-initial-state', handleStateRequest);
        };
    }, [isHost, roomId, initialSyncDone, activeStream]);

    useEffect(() => {
        const handleHostDisconnect = async () => {
            if (!playerInstanceRef.current) return;

            try {
                // Pause the video
                await playerInstanceRef.current.pauseVideo();
                setIsPlaying(false);

                // Show notification
                toast.info("Host has left the room. Stream paused.");
                socket.emit("")
                // If there is an active stream, update its state
                if (activeStream) {
                    setActiveStream(prev => ({
                        ...prev!,
                        isPlaying: false
                    }));
                }
            } catch (error) {
                console.error('Error handling host disconnect:', error);
            }
        };

        socket.on('host-disconnected', handleHostDisconnect);

        return () => {
            socket.off('host-disconnected', handleHostDisconnect);
        };
    }, [activeStream]);


    return (
        <Card className="bg-zinc-900 relative h-full w-full md:mx-auto">
            <CardContent className="p-0">
                {loading ? (
                    <div>
                        <Skeleton className="aspect-video bg-zinc-900" />
                        <div className="p-4 flex justify-between">
                            <Skeleton className="h-6 w-3/4" />
                        </div>
                    </div>
                ) : (
                    <div className="md:w-full flex flex-col max-md:w-[94vw] mx-auto">
                        <div className="aspect-video bg-zinc-800 flex overflow-hidden">
                            {activeStream ? (
                                <>
                                    {/* <img src={activeStream.img} alt="" className='aspect-video' /> */}
                                    <div ref={playerContainerRef} className="aspect-video relative cursor-not-allowed pointer-events-none select-none" style={{
                                        WebkitUserSelect: "none", // Safari compatibility
                                        MozUserSelect: "none", // Firefox compatibility
                                    }}>
                                        {/* {isBuffering && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                                            </div>
                                        )} */}
                                    </div>
                                </>
                            ) : (
                                <div className="bg-zinc-900 flex w-full justify-center items-center h-full">
                                    No Active Stream
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-col items-center gap-2">
                            <div className="w-full md:mb-2">
                                {activeStream ? (
                                    <div className="flex-1 mr-4">
                                        <h2 className="text-lg font-semibold text-white truncate">
                                            {activeStream.title}
                                        </h2>
                                    </div>
                                ) : (
                                    <div className="text-lg font-semibold text-white">
                                        No Active Stream
                                    </div>
                                )}
                            </div>
                            <div className="w-full flex justify-start gap-2">
                                {isHost && activeStream && (
                                    <Button
                                        onClick={handlePlayPause}
                                        className="font-semibold"
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-4 w-4 md:mx-2" />
                                        ) : (
                                            <Play className="h-4 w-4 md:mx-2" />
                                        )}
                                    </Button>
                                )}
                                {canPlay && (
                                    <Button
                                        onClick={handleNext}
                                        disabled={loading}
                                        className="font-semi-bold"
                                    >
                                        Play Next<ChevronLast className="w-4 h-4 md:ml-2" />
                                    </Button>
                                )}
                                {
                                    !isHost && activeStream && (
                                        <Button className='font-semibold cursor-default hover:bg-white'>Streamed by {creator?.name}</Button>
                                    )
                                }
                            </div>
                        </div>

                    </div>
                )}
            </CardContent>
        </Card>
    );
}