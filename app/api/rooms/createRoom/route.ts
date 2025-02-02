import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) { }

export async function POST(req: NextRequest) {
    const { hostId, name } = await req.json();

    try {
        const room = await prismaClient.room.create({
            data: {
                hostId: hostId,
                name: name
            },
            include: {
                members: true
            }
        });
        const roomData = {
            id: room.id,
            hostId: room.hostId,
            name: room.name,
            isActive: room.isActive,
            members: room.members
        }

        return NextResponse.json({ success: true, room: roomData }, { status: 200 });
    }
    catch (e: any) {
        return NextResponse.json({ success: false, message: e.message }, { status: 400 });
    }
}