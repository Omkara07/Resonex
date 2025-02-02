import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) { }

export async function POST(req: NextRequest) {
    const { roomId } = await req.json();

    try {
        const room = await prismaClient.room.findUnique({
            where: {
                id: roomId
            },
            include: {
                members: true,
                host: true,
                streams: true
            }
        });
        if (!room) {
            return NextResponse.json({ success: false, message: "Room not found" }, { status: 400 })
        }
        const roomData = {
            id: room?.id,
            hostId: room?.hostId,
            name: room?.name,
            isActive: room?.isActive,
            members: room?.members,
            streams: room?.streams,
            host: room?.host
        }

        return NextResponse.json({ success: true, room: roomData }, { status: 200 });
    }
    catch (e: any) {
        return NextResponse.json({ success: false, message: e.message }, { status: 400 });
    }
}