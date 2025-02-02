import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { roomId, userId } = await req.json();
    try {
        const room = await prismaClient.room.update({
            where: {
                id: roomId
            },
            data: {
                members: {
                    connect: {
                        id: userId
                    }
                }
            }
        })
        return NextResponse.json({ room, message: "Room joined successfully" }, { status: 200 });
    }
    catch (e) {
        return NextResponse.json({ message: "Error joining room", error: e }, { status: 400 });
    }

}