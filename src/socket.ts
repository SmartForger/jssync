import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { aesDecrypt, aesEncrypt, decryptRSA } from "./cipher";
import { getChannelById } from "./channel";
import { uploadManager } from "./upload-manager";
import { FileInfo } from "./types";

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
        const decrypted = decryptSocketMessage(data);
        if (decrypted.cid && decrypted.data) {
          const cid = decrypted.cid;
          const fileInfo = JSON.parse(decrypted.data) as FileInfo;

          uploadManager.addFile(fileInfo);

          const handleUpload = (data: any) => {
            if (!data) {
              return;
            }

            if (data === 'end') {
              socket.off(`f_${fileInfo.id}`, handleUpload);
              socket.emit(`f_${fileInfo.id}_ack`, encryptSocketResponse(cid, '-1'));
            } else {
              const index = uploadManager.addFileData(fileInfo.id, data);
              socket.emit(`f_${fileInfo.id}_ack`, encryptSocketResponse(cid, index.toString()));
            }
          }
          socket.on(`f_${fileInfo.id}`, handleUpload);

          socket.emit("f_ack", data.t);
          socket.broadcast.to(cid).emit("freceive", data.t);
        }
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("f_request", (data) => {
      try {
        const decrypted = decryptSocketMessage(data);
        if (decrypted.data) {
          const fileInfo = JSON.parse(decrypted.data) as FileInfo;

          const fileReqHandler = (data: any) => {
            const decrypted = decryptSocketMessage(data);
            const index = +decrypted.data;
    
            if (index < 0) {
              uploadManager.removeFile(fileInfo.id);
              socket.off(`f_req_${fileInfo.id}`, fileReqHandler);
            } else {
              const d = uploadManager.getFileData(fileInfo.id, index);
              socket.emit(`f_res_${fileInfo.id}`, d);
            }
          }
          socket.on(`f_req_${fileInfo.id}`, fileReqHandler);

          socket.emit("f_response", data.t);
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

function encryptSocketResponse(cid: string, data: any) {
  const channel = getChannelById(cid);
  if (!channel) {
    return "";
  }

  return aesEncrypt(data, channel.secret);
}

export function getSocketIO() {
  return io;
}
