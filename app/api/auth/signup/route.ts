import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // body
    const { email, password, name } = await req.json();

    try {
        const u = await prismaClient.user.findUnique({
            where: {
                email: email
            }
        });
        if (u) {
            return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 })
        }
        const user = await prismaClient.user.create({
            data: {
                email,
                password,
                name,
                provider: "Credentials"
            }
        })

        return NextResponse.json({ email: user.email, name: user.name, image: user.image, success: true })
    }
    catch (e: any) {
        return NextResponse.json({ success: false, message: e.message })
    }
}