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

declare global {
    interface Window {
        YT: {
            Player: new (
                element: string | HTMLElement,
                config: {
                    videoId?: string;
                    playerVars?: {
                        autoplay?: 1;
                        controls?: 0;
                        modestbranding?: 1;
                        rel?: 0;
                        showinfo?: 0;
                    };
                    events?: {
                        onReady?: (event: any) => void;
                        onStateChange?: (event: any) => void;
                    };
                }
            ) => void;
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

export function YouTubePlayer({ canPlay, creatorId }: { canPlay: boolean, creatorId: string }) {
    const { activeStream, setActiveStream, getStreams }: {
        activeStream: Song | null, setActiveStream: React.Dispatch<React.SetStateAction<Song | null>>, getStreams: ({ creatorId }: { creatorId: string }) => Promise<void>;
    } = useSongQueue();

    const session: any = useSession();
    const [loading, setLoading] = useState<boolean>(false);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const playerInstanceRef = useRef<any>(null);
    const stateChangeHandled = useRef<boolean>(false);

    const handleNext = async () => {
        if (stateChangeHandled.current) return;
        stateChangeHandled.current = true;

        setLoading(true);
        try {
            const res = await axios.get('/api/streams/next');
            if (res.data.stream) {
                setActiveStream(res.data.stream);
                await getStreams({ creatorId });
            }
        } catch (e) {
            setActiveStream(null);
            console.log(e);
        } finally {
            setLoading(false);
            // Reset the flag after a short delay
            setTimeout(() => {
                stateChangeHandled.current = false;
            }, 1000);
        }
    }

    useEffect(() => {
        let scriptLoaded = false;
        let playerInitialized = false;

        const loadYouTubeAPI = () => {
            if (!window.YT && !scriptLoaded) {
                scriptLoaded = true;
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            }
        };

        const initializePlayer = () => {
            if (!activeStream || !playerContainerRef.current || playerInitialized) return;

            playerInitialized = true;
            try {
                playerInstanceRef.current = new window.YT.Player(playerContainerRef.current, {
                    videoId: activeStream.extractedId,
                    playerVars: {
                        autoplay: 1,
                        // @ts-ignore
                        controls: creatorId === session?.data?.user?.id ? 1 : 0,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0
                    },
                    events: {
                        onStateChange: (event) => {
                            if (event.data === window.YT.PlayerState.ENDED) {
                                handleNext();
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error initializing player:', error);
            }
        };

        loadYouTubeAPI();

        const initializeOnReady = () => {
            if (window.YT && window.YT.Player) {
                initializePlayer();
            } else {
                window.onYouTubeIframeAPIReady = initializePlayer;
            }
        };

        // Wait for both the API and the container to be ready
        const checkReadyState = setInterval(() => {
            if (window.YT && window.YT.Player && playerContainerRef.current) {
                clearInterval(checkReadyState);
                initializeOnReady();
            }
        }, 100);

        return () => {
            clearInterval(checkReadyState);
            if (playerInstanceRef.current) {
                try {
                    playerInstanceRef.current.destroy();
                } catch (error) {
                    console.error('Error destroying player:', error);
                }
            }
            playerInstanceRef.current = null;
            playerInitialized = false;
            stateChangeHandled.current = false;
        };
    }, [activeStream?.extractedId, creatorId, session?.data?.user?.id]);

    return (
        <Card className="overflow-hidden bg-gray-950 relative md:w-[80%] md:mx-auto">
            <CardContent className="p-0">
                {loading ? (
                    <div>
                        <Skeleton className="aspect-video bg-gray-900" />
                        <div className="p-4 flex justify-between">
                            <Skeleton className="text-lg font-semibold text-white" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="aspect-video bg-gray-800">
                            {activeStream ? (
                                <div ref={playerContainerRef} className="w-full h-full" />
                            ) : (
                                <div className='bg-gray-900 flex justify-center items-center h-full'>
                                    No Active Stream
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex justify-between">
                            {activeStream ? (
                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        {activeStream.title}
                                    </h2>
                                </div>
                            ) : (
                                <div className="text-lg font-semibold text-white">
                                    No Active Stream
                                </div>
                            )}
                            {canPlay && (
                                <Button onClick={() => handleNext()}>
                                    Play Next<ChevronLast size={96} className="w-4 h-4 text-xl" />
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}