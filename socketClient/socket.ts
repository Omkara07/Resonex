"use client"
import { io } from "socket.io-client";

let socket: any
if (typeof window !== "undefined") {
    socket = io("http://localhost:5000", {
        transports: ["websocket"], // You can try forcing WebSocket transport
    })
}

export { socket }