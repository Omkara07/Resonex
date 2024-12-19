import { Card, CardContent } from '@/components/ui/card'

export function YouTubePlayer() {
    return (
        <Card className="overflow-hidden bg-gray-950 relative">
            <CardContent className="p-0">
                <div className="aspect-video bg-gray-800">
                    <img
                        // src="/placeholder.svg?height=720&width=1280"
                        src="https://i.ytimg.com/vi/XO8wew38VM8/sddefault.jpg"
                        alt="YouTube video player"
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-white">Now Playing: Cosmic Harmony</h2>
                    <p className="text-sm text-gray-400">Stellar Soundscapes</p>
                </div>
            </CardContent>
        </Card>
    )
}

