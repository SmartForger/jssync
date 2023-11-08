import { chatlib } from "./chatlib";
import {
  addMessage,
  addSystemMessage,
  showChatScreen,
  showLoginScreen,
  uiFinishSendingFile,
  uiStartSendingFile,
  uiFileReceived,
  uiUploadProgress,
  uiStartReceivingFile,
} from "./ui";
import { FileUploader } from './file-uploader';

let socket = null;
const uploader = FileUploader();

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

    if (fileInfo.complete) {
      const f = uploader.getFileInfo(fileInfo.fileId);
      if (f) {
        const b = new Blob(f.data, { type: "octet/stream" });
        uiFileReceived(f.name, b);
      }
    } else {
      if (fileInfo.chunkIndex === 0) {
        uploader.startReceiving(fileInfo.fileId, fileInfo.filename, fileInfo.totalSize);
        uiStartReceivingFile(fileInfo.filename);
      } else {
        uiUploadProgress(uploader.getUploadProgress(fileInfo.fileId));
      }

      uploader.receiveChunk(fileInfo.fileId, fileInfo.chunkIndex, decodeURI(fileInfo.chunk));
    } 
  });

  socket.on("f_ack", async (data) => {
    const decrypted = chatlib.decryptSocketResponse(data);
    const fileInfo = JSON.parse(decrypted);
    const f = uploader.getFileInfo(fileInfo.fileId);
    if (!f) {
      return;
    }

    if (!fileInfo.complete) {
      uploader.setChunkIndex(fileInfo.fileId, fileInfo.chunkIndex + 1);
      uiUploadProgress(uploader.getUploadProgress(fileInfo.fileId));
      sendChunk(fileInfo.fileId);
    } else {
      uiFinishSendingFile(f.name);
      uploader.removeFile(fileInfo.fileId);
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

    if (data.file) {
      uiStartSendingFile();

      console.log(222, data.file);
      const fileId = uploader.startUploadingFile(data.file);
      sendChunk(fileId);
    }
  }
}

async function sendChunk(fileId) {
  try {
    const fileInfo = uploader.getFileInfo(fileId);
    if (!fileInfo) {
      throw new Error('file not found');
    }

    const chunk = uploader.getChunk(fileId);
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
