import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { roomId } = await req.json();
    try {
        const room = await prismaClient.room.delete({ where: { id: roomId } });
        return NextResponse.json({ room, message: "Room deleted successfully" }, { status: 200 });
    }
    catch (e) {
        return NextResponse.json({ message: "Error deleting room", error: e }, { status: 400 });
    }
}