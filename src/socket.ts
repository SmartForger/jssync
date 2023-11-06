import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { aesDecrypt, decryptRSA } from "./cipher";
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
        const decrypted = decryptSocketMessage(data);
        if (!decrypted.cid) {
          return;
        }

        const message = JSON.parse(decrypted.data);
        socket.broadcast.to(decrypted.cid).emit("receive", message);
      } catch (e) {
        console.log(e);
      }
    });
  });
}

function decryptSocketMessage(data: { t: string; c: string }) {
  const cid = decryptRSA(data.c);
  const channel = getChannelById(cid || "");
  if (!channel) {
    return { data: "", cid: "" };
  }

  return {
    data: aesDecrypt(data.t, channel.secret),
    cid,
  };
}

export function getSocketIO() {
  return io;
}
