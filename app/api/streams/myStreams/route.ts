import { NEXT_AUTH_CONFIG } from "@/app/lib/auth"
import { prismaClient } from "@/lib/db"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    if (!session && session.user) {
        return NextResponse.json({
            message: "User not found"
        }, {
            status: 403
        })
    }
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: session.user?.id
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
    })
    return NextResponse.json({
        streams: streams.map(({ _count, ...rest }) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false
        }))
    })
}