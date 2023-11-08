import { chatlib } from "./chatlib";
import {
  addMessage,
  addSystemMessage,
  showChatScreen,
  showLoginScreen,
  uiStartSendingFile,
  uiFinishSendingFile,
  uiSetFileProgress,
  uiStartReceivingFile,
  uiFileReceived,
} from "./ui";
import { fileUploader } from './file-uploader';

let socket = null;

function initSocketIO() {
  socket = io();

  socket.on("connect", () => {
    const channel = chatlib.getChannel();
    socket.emit("join", channel.id);
    console.log("Connected to server");
  });

  socket.on("joined", (msg) => {
    addSystemMessage(`Joined room: "${msg}"`);
  });

  socket.on("receive", async (data) => {
    const decrypted = chatlib.decryptSocketResponse(data);
    addMessage(decrypted.username, decrypted.message);
  });

  socket.on('freceive', async (data) => {
    const fileInfo = chatlib.decryptSocketResponse(data);

    console.log('freceive', fileInfo.fileId, fileInfo.chunkIndex);

    if (fileInfo.complete) {
      const f = fileUploader.getFileInfo(fileInfo.fileId);
      if (f) {
        const b = new Blob(f.data, { type: "octet/stream" });
        uiFileReceived(f.id, f.name, b);
      }
    } else {
      if (fileInfo.chunkIndex === 0) {
        fileUploader.startReceiving(fileInfo.fileId, fileInfo.filename, fileInfo.totalSize);
        uiStartReceivingFile(fileInfo.fileId, fileInfo.filename);
      } else {
        uiSetFileProgress(fileId, fileUploader.getUploadProgress(fileInfo.fileId));
      }

      fileUploader.receiveChunk(fileInfo.fileId, fileInfo.chunkIndex, decodeURI(fileInfo.chunk));
    } 
  });

  socket.on("f_ack", async (data) => {
    const decrypted = chatlib.decryptSocketResponse(data);
    const fileInfo = JSON.parse(decrypted);
    const f = fileUploader.getFileInfo(fileInfo.fileId);
    if (!f) {
      return;
    }

    console.log('f_ack', fileInfo);
    if (!fileInfo.complete) {
      fileUploader.setChunkIndex(fileInfo.fileId, fileInfo.chunkIndex + 1);
      uiSetFileProgress(fileInfo.fileId, fileUploader.getUploadProgress(fileInfo.fileId));
      sendChunk(fileInfo.fileId);
    } else {
      uiFinishSendingFile(f.id, f.name);
      fileUploader.removeFile(fileInfo.fileId);
    }
  });
}

async function loginHandler(data) {
  const isLoggedin = await chatlib.login(data);

  if (isLoggedin) {
    showChatScreen(sendMessage);
    initSocketIO();
  }
}

async function sendMessage(data) {
  if (socket) {
    if (data.text) {
      const textData = JSON.stringify({
        username: chatlib.getDisplayName(),
        message: data.text,
      });

      socket.emit("broadcast", await chatlib.getSocketMessage(textData));
      addMessage(chatlib.getDisplayName(), data.text);
    }

    if (data.fileId) {
      const f = fileUploader.getFileInfo(data.fileId);
      if (f) {
        console.log(222, f);
        uiStartSendingFile(f.id, f.name);
        sendChunk(f.id);
      }
    }
  }
}

async function sendChunk(fileId) {
  try {
    const fileInfo = fileUploader.getFileInfo(fileId);
    if (!fileInfo) {
      throw new Error('file not found');
    }

    const chunk = fileUploader.getChunk(fileId);
    let uploadedData = {};
    if (chunk.size) {
      const blobData = await chunk.text();
      const temp = encodeURI(blobData);
      uploadedData = {
        chunk: temp,
        chunkIndex: fileInfo.chunkIndex,
        fileId: fileInfo.id,
      };
      if (fileInfo.chunkIndex === 0) {
        uploadedData.filename = fileInfo.name;
        uploadedData.totalSize = fileInfo.totalSize;
      }
    } else {
      uploadedData = {
        chunkIndex: fileInfo.chunkIndex,
        fileId: fileInfo.id,
        complete: true,
      };
    }

    const sm = await chatlib.getSocketMessage(JSON.stringify(uploadedData));
    socket.emit('fbroadcast', sm);

    if (!chunk.size) {
      throw new Error('no more data');
    }
  } catch (e) {
    console.error(e);
  }
}

async function init() {
  await chatlib.loadLocalData();

  if (chatlib.isLoggedIn()) {
    showChatScreen(sendMessage);
    initSocketIO();
  } else {
    showLoginScreen(loginHandler);
  }
}

init();
