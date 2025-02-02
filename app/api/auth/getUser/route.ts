import { NEXT_AUTH_CONFIG } from "@/app/lib/auth";
import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // body
    const session = await getServerSession(NEXT_AUTH_CONFIG);

    try {
        const u = await prismaClient.user.findUnique({
            where: {
                email: session?.user?.email
            },
            include: {
                hostedRooms: {
                    include: {
                        members: true
                    }
                },
                memberOfRooms: {
                    include: {
                        members: true
                    }
                }
            }
        });
        if (u) {
            const user = {
                id: u.id,
                email: u.email,
                name: u.name,
                image: u.image,
                hostedRooms: u.hostedRooms,
                memberOfRooms: u.memberOfRooms
            }
            return NextResponse.json({ success: true, user }, { status: 200 })
        }
        else {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 400 })
        }

    }
    catch (e: any) {
        return NextResponse.json({ success: false, message: e.message })
    }
}