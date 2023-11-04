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
      socket.broadcast.emit("receive", msg);
    });
  });
}

export function getSocketIO() {
  return io;
}
