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

    socket.on("fbroadcast", (data) => {
      try {
        const cid = getChannelId(data);
        if (!cid) {
          return;
        }

        socket.broadcast.to(cid).emit("freceive", data.t);

        const decrypted = decryptSocketMessage(data);
        if (decrypted.cid && decrypted.data) {
          const msg = JSON.parse(decrypted.data);

          const resData = JSON.stringify({
            fileId: msg.fileId,
            chunkIndex: msg.chunkIndex,
            complete: msg.complete,
          });
          socket.emit("f_ack", encryptSocketResponse(decrypted.cid, resData));
        }
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

function encryptSocketResponse(cid: string, data: string) {
  const channel = getChannelById(cid);
  if (!channel) {
    return "";
  }

  return aesEncrypt(JSON.stringify(data), channel.secret);
}

export function getSocketIO() {
  return io;
}
