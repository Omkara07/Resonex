import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
    const roomId = req.nextUrl.searchParams.get("roomId");
    try {

        const playedSongs = await prismaClient.stream.findMany({ where: { roomId: roomId ?? "", played: true } });
        return NextResponse.json({ success: true, playedSongs }, { status: 200 })
    }
    catch (e) {
        return NextResponse.json({ success: false, message: "Error getting streams" }, { status: 400 })
    }
}

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { roomId, songId } = await req.json();

        // Update
        await prismaClient.stream.update({
            where: { id: songId, roomId },
            data: {
                played: false,
                upvotes: {
                    deleteMany: {} // Deletes all upvotes associated with the stream
                }
            },
        });

        // Fetch all other songs in the room
        const playedSongs = await prismaClient.stream.findMany({
            where: {
                roomId,
                played: true,
                id: { not: songId }, // Exclude the updated song
            },
        });

        return NextResponse.json({ success: true, playedSongs }, { status: 200 });
    } catch (error) {
        console.error("Error updating song:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}