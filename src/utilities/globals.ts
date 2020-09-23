import socketIO from "socket.io";

export const socketAgentMap = new Map<SocketIO.Socket, number>();