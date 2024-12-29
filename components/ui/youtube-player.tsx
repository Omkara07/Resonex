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

export function YouTubePlayer({ canPlay, creatorId }: { canPlay: boolean, creatorId: string }) {
    const { activeStream, setActiveStream, getStreams } = useSongQueue();
    const session: any = useSession();
    const [loading, setLoading] = useState<boolean>(false);

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
            // First, remove the iframe to prevent DOM node issues
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

    const handleNext = async () => {
        if (loading || stateChangeHandled.current) return;

        stateChangeHandled.current = true;
        setLoading(true);

        try {
            // Properly destroy the player before fetching next song
            destroyPlayer();

            const res = await axios.get('/api/streams/next');

            if (res.data.stream) {
                setActiveStream(res.data.stream);
                await getStreams({ creatorId });
            } else {
                setActiveStream(null);
            }
        } catch (e) {
            console.error('Error fetching next stream:', e);
            setActiveStream(null);
        } finally {
            setLoading(false);
            // debounce effect to prevent multiple clicks
            setTimeout(() => {
                stateChangeHandled.current = false;
            }, 1000);
        }
    };

    useEffect(() => {
        // Load the YouTube iframe API when the component mounts
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

        const initializePlayer = () => {
            if (!activeStream?.extractedId || !playerContainerRef.current || playerInitializedRef.current) return;

            // Create a new container for the player
            const playerElement = document.createElement('div');
            playerElement.id = 'youtube-player';
            playerContainerRef.current.appendChild(playerElement);

            playerInitializedRef.current = true;

            try {
                // create new iframe player
                playerInstanceRef.current = new window.YT.Player('youtube-player', {
                    videoId: activeStream.extractedId,
                    playerVars: {
                        autoplay: 1,
                        mute: 0,
                        controls: creatorId === session?.data?.user?.id ? 1 : 0,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                    },
                    width: '100%',
                    height: '100%',
                    events: {
                        onReady: (event) => {
                            console.log('Player ready');
                        },
                        onStateChange: (event) => {
                            if (event.data === window.YT.PlayerState.ENDED && !loading && !stateChangeHandled.current) {
                                handleNext();
                            }
                        },
                        onError: (event) => {
                            console.error('YouTube player error:', event.data);
                            if (!loading && !stateChangeHandled.current) {
                                handleNext();
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error initializing player:', error);
                playerInitializedRef.current = false;
            }
        };

        loadYouTubeAPI();

        const checkReadyState = setInterval(() => {
            // create a player if the div element is ready and the player is not initialized yet 
            if (window.YT && window.YT.Player && playerContainerRef.current && !playerInitializedRef.current) {
                clearInterval(checkReadyState);
                initializePlayer();
            }
        }, 100);

        // Cleanup function
        return () => {
            clearInterval(checkReadyState);
            destroyPlayer();
        };
    }, [activeStream?.extractedId, creatorId, session?.data?.user?.id, loading]);

    return (
        <Card className=" bg-gray-950 relative md:w-[80%] w-screen md:mx-auto">
            <CardContent className="p-0">
                {loading ? (
                    <div>
                        <Skeleton className="aspect-video bg-gray-900" />
                        <div className="p-4 flex justify-between">
                            <Skeleton className="h-6 w-3/4" />
                        </div>
                    </div>
                ) : (
                    <div className='md:w-full flex flex-col max-md:w-full ' >
                        <div className="aspect-video bg-gray-800 relative overflow-hidden max-w-full">
                            {activeStream ? (
                                <div ref={playerContainerRef} className="absolute inset-0 "
                                    style={{ contain: 'strict' }} />
                            ) : (
                                <div className='bg-gray-900 flex justify-center items-center h-full'>
                                    No Active Stream
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <div className='w-2/3'>
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
                            <div className='w-1/3'>
                                {canPlay && (
                                    <Button
                                        onClick={handleNext}
                                        disabled={loading}
                                        className='font-semi-bold'
                                    >
                                        Play Next<ChevronLast className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card >
    );
}