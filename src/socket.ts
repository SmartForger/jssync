import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { aesDecrypt, aesEncrypt, decryptRSA } from "./cipher";
import { getChannelById } from "./channel";

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
        const cid = getChannelId(data);
        if (!cid) {
          return;
        }

        socket.broadcast.to(cid).emit("receive", data.t);
      } catch (e) {
        console.log(e);
      }
    });
  });
}

function getChannelId(data: { t: string; c: string }) {
  const cid = decryptRSA(data.c);
  const channel = getChannelById(cid || "");

  return channel?.id || "";
}

export function getSocketIO() {
  return io;
}
