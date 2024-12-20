import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"
import { google } from "googleapis"
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/app/lib/auth";

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
})
const YT_Regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s]*)/;

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId")
    if (!creatorId) {
        return NextResponse.json({
            message: "User not found"
        }, {
            status: 403
        })
    }
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    if (!session) {
        return NextResponse.json({
            message: "User not found"
        }, {
            status: 403
        })
    }
    const [streams, activeStreams] = await Promise.all([prismaClient.stream.findMany({
        where: {
            userId: creatorId,
            played: false
        },
        include: {
            _count: {
                select: {
                    upvotes: true
                }
            },
            upvotes: {
                where: {
                    userId: session.user?.id
                }
            }
        }
    }), prismaClient.currentStream.findUnique({
        where: {
            userId: creatorId
        },
        include: {
            stream: true
        }
    })])
    return NextResponse.json({
        streams: streams.map(({ _count, ...rest }) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false
        })),
        activeStreams
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
        const extractedId = data.url.includes("youtu.be")
            ? data.url.split("youtu.be/")[1].split("?")[0]
            : data.url.split("?v=")[1];
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