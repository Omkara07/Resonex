import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
    try {
        const extractedId = req.nextUrl.searchParams.get("videoId")
        if (!extractedId) {
            return NextResponse.json({
                message: "Invalid video id"
            }, {
                status: 411
            })
        }
        const youtube = google.youtube({
            version: "v3",
            auth: process.env.YOUTUBE_API_KEY ?? "",
        });
        const params = {
            part: ['snippet'],
            id: [extractedId],
        };
        const response: any = await youtube.videos.list(params);

        if (response.data.items && response.data.items.length > 0) {
            const video = response?.data.items[0];
            const title = video.snippet?.title
            const thumbnail = video.snippet?.thumbnails.standard
            return NextResponse.json({
                title,
                thumbnail
            }, {
                status: 200
            })
        }
        return NextResponse.json({
            message: "error while fetching video metadata"
        }, {
            status: 411
        })
    }
    catch (e) {
        console.log(e)
        return NextResponse.json({
            message: "error while fetching video metadata"
        }, {
            status: 411
        })
    }
}