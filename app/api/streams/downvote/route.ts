import { NEXT_AUTH_CONFIG } from "@/app/lib/auth";
import { prismaClient } from "@/lib/db";
import { Prisma, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"

const upvoteSchema = z.object({
    streamId: z.string(),
    userId: z.string()
})

export async function POST(req: NextRequest) {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const user = prismaClient.user.findUnique({
        where: {
            email: session?.user?.email ?? ""
        }
    })
    if (!user) {
        return NextResponse.json({
            message: "User not found"
        }, {
            status: 403
        })
    }
    try {
        const data = upvoteSchema.parse(await req.json())
        await prismaClient.upvote.delete({
            where: {
                userId_streamId: {
                    streamId: data.streamId,
                    userId: data.userId
                }
            }
        })
    }
    catch (e) {
        return NextResponse.json({
            message: "error while upvoting a stream"
        }, {
            status: 500
        })
    }
    return NextResponse.json({
        message: "downvote added"
    })
}
