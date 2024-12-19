import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"
import { google } from "googleapis"

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
})
export const YT_Regex = /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+$/

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId")
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? ""
        }
    })
    console.log(streams)
    return NextResponse.json({
        streams
    })
}

export async function POST(req: NextRequest) {
    try {
        const data = CreateStreamSchema.parse(await req.json());
        if (!YT_Regex.test(data.url)) {
            return NextResponse.json({
                message: "Invalid url format"
            }, {
                status: 411
            })
        }
        const extractedId = data.url.split("?v=")[1]
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
            const stream = await prismaClient.stream.create({
                data: {
                    userId: data.creatorId,
                    url: data.url,
                    extractedId,
                    type: "Youtube",
                    title: title ?? "Titleless Stream",
                    img: thumbnail.url ?? "https://media.wired.com/photos/5f9ca518227dbb78ec30dacf/master/pass/Gear-RIP-Google-Music-1194411695.jpg"
                }
            })
            return NextResponse.json({
                message: "stream added",
                id: stream.id
            }, {
                status: 200
            })
        }
    }
    catch (e) {
        console.log(e)
        return NextResponse.json({
            message: "error while adding a stream"
        }, {
            status: 411
        })
    }
}