import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const roomName = req.nextUrl.searchParams.get("roomName")?.toLowerCase();
        const userId = req.nextUrl.searchParams.get("userId"); // Assuming userId is passed in query

        if (!roomName || !userId) {
            return NextResponse.json({ error: "Missing roomName or userId" }, { status: 400 });
        }

        const rooms = await prismaClient.room.findMany({
            where: {
                name: {
                    contains: roomName,
                    mode: "insensitive"
                },
                NOT: {
                    hostId: userId, // Exclude rooms where the user is the host
                },
            },
            include: {
                host: true,
                members: true
            }
        });

        return NextResponse.json(rooms, { status: 200 });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}  