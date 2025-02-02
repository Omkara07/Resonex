import { createServer } from "http";
import next from "next";
import { Server, Socket } from "socket.io";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "./app/lib/auth.ts";
import { prismaClient } from "./lib/db.ts";
// const { NEXT_AUTH_CONFIG } = await import("./app/lib/auth.ts");
// const { prismaClient } = await import("./lib/db.ts");
// import { HandleJoinRoomSocket } from "./Socket/handleJoinRoomSocket";

// In your server.ts
export const HandleJoinRoomSocket = (socket: Socket, io: Server) => {
    socket.on("join-room", ({ roomId, userName, roomName }) => {
        socket.join(roomId);
        // Emit only to others in the room
        socket.to(roomId).emit("joined-message", `${userName} joined ${roomName}`);
    });
};

export const HandleleaveRoomSocket = (socket: Socket, io: Server) => {
    socket.on("leave-room", (roomId: string) => {
        socket.leave(roomId);
        socket.to(roomId).emit("left-message", `A user left the room`);
    });
};

export const HandleSongQueueSocket = (socket: Socket, io: Server) => {
    socket.on('queue-update', async ({ roomId }) => {
        try {
            const session = await getServerSession(NEXT_AUTH_CONFIG);
            const streams = await prismaClient.stream.findMany({
                where: {
                    roomId: roomId,
                    played: false
                },
                include: {
                    _count: {
                        select: {
                            upvotes: true
                        }
                    },
                    upvotes: {
                        where: {
                            userId: session.user?.id
                        }
                    }
                }
            })

            io.to(roomId).emit("updated-queue", { streams });
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('curStream-update', async ({ roomId }) => {
        try {
            const activeStream = await prismaClient.currentStream.findUnique({
                where: {
                    roomId: roomId
                },
                include: {
                    stream: true
                }
            })

            io.to(roomId).emit('updated-activeStream', { activeStream });
        }
        catch (e) {
            console.log(e)
        }
    })
};

// Check the environment
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
// creates the next.js app according to the environment
const app = next({ dev });
// create default request handler for nextjs to handle all http requests
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            // Handle authentication routes separately
            if (req.url?.startsWith('/api/auth')) {
                return await handle(req, res);
            }

            // Handle all other requests
            await handle(req, res);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    });

    const io = new Server(httpServer, {
        path: '/socket.io/',
        addTrailingSlash: false,
        // Add cors if needed
        cors: {
            origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
        }
    });

    io.on("connection", (socket) => {
        console.log("socket is working successfully");
        console.log("all rooms ", io.sockets.adapter.rooms);

        socket.on("message", (data) => {
            socket.broadcast.emit("message", data);
        });

        HandleJoinRoomSocket(socket, io);
        HandleleaveRoomSocket(socket, io);
        HandleSongQueueSocket(socket, io);
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});