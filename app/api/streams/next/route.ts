import { NEXT_AUTH_CONFIG } from "@/app/lib/auth";
import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    if (!session && !session.user.id) {
        return NextResponse.json({
            message: "User not found"
        }, {
            status: 403
        })
    }
    const mostUpvotedStream = await prismaClient.stream.findFirst({
        where: {
            userId: session.user.id,
            played: false
        },
        orderBy: [
            {
                upvotes: {
                    _count: 'desc'
                }
            },
            { title: 'asc' },
        ],
    })
    const user = session.user
    const stream = await Promise.all([prismaClient.currentStream.upsert({
        where: {
            userId: user?.id ?? ""
        },
        update: {
            userId: user.id ?? "",
            streamId: mostUpvotedStream?.id ?? ""
        },
        create: {
            userId: user.id ?? "",
            streamId: mostUpvotedStream?.id ?? ""
        }
    }), prismaClient.stream.update({
        where: {
            id: mostUpvotedStream?.id ?? ""
        },
        data: {
            played: true,
            playedTs: new Date()
        }
    })])
    return NextResponse.json({
        stream: mostUpvotedStream
    })

}