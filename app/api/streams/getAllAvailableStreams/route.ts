import { NEXT_AUTH_CONFIG } from "@/app/lib/auth"
import { prismaClient } from "@/lib/db"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const roomId = req.nextUrl.searchParams.get("roomId")
    if (!roomId) {
        return NextResponse.json({
            message: "Room not found"
        }, {
            status: 403
        })
    }
    const streams = await prismaClient.stream.findMany({
        where: {
            roomId: roomId
        }
    })
    return NextResponse.json({
        success: true,
        streams
    })
}