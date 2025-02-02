import { Server, Socket } from "socket.io";

export const HandleJoinRoomSocket = (socket: Socket, io: Server) => {
    socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        io.to(roomId).emit("joined-message", `${socket.id} joined ${roomId}`);
    });
};