"use client"
import { io } from "socket.io-client";

let socket: any
if (typeof window !== "undefined") {
    const socket_url = process.env.NEXT_PUBLIC_SOCKET_SERVER_API_URL;
    socket = io(socket_url)
}

export { socket }