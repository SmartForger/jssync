import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export function setupSocketIO(server: HttpServer) {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("join", (msg) => {
      socket.join(msg);
      socket.emit("joined", msg);
    });

    socket.on("broadcast", (msg) => {
      try {
        for (const room of socket.rooms.entries()) {
          socket.broadcast.to(room).emit("receive", msg);
        }
      } catch {}
    });
  });
}

export function getSocketIO() {
  return io;
}
