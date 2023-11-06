import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { aesDecrypt, decryptRSA } from "./cipher";

let io: Server;

export function setupSocketIO(server: HttpServer) {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("join", (msg) => {
      socket.join(msg);
      socket.emit("joined", msg);
    });

    socket.on("broadcast", (data) => {
      try {
        const decrypted = decryptSocketMessage(data);
        const message = JSON.parse(decrypted || '');

        for (const room of socket.rooms.entries()) {
          socket.broadcast.to(room).emit("receive", message);
        }
      } catch (e) {
        console.log(e);
      }
    });
  });
}

function decryptSocketMessage(data: { msg: string, key: string }) {
  const aeskey = decryptRSA(data.key);
  if (!aeskey) {
    return null;
  }

  return aesDecrypt(data.msg, aeskey);
}

export function getSocketIO() {
  return io;
}
