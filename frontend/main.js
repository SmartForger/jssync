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
    const fileInfo = chatlib.decryptSocketResponse(data);

    const ackHandler = (data) => {
      const index = +chatlib.decryptData(data);
      console.log(111, `f_${fileInfo.id}_ack`, index);

      if (index < 0) {
        uiFinishSendingFile(fileInfo.id, fileInfo.name);
        fileUploader.removeFile(fileInfo.id);
        socket.off(`f_${fileInfo.id}_ack`, ackHandler);
      } else {
        fileUploader.setChunkIndex(fileInfo.id, index);
        uiSetFileProgress(fileInfo.id, fileUploader.getUploadProgress(fileInfo.id));
        sendChunk(fileInfo.id);
      }
    }

    socket.on(`f_${fileInfo.id}_ack`, ackHandler);

    sendChunk(fileInfo.id);
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
        sendFileInfo(f.id);
      }
    }
  }
}

async function sendFileInfo(fileId) {
  const fileInfo = fileUploader.getFileInfo(fileId);
  if (!fileInfo) {
    throw new Error('file not found');
  }

  const uploadedData = {
    id: fileInfo.id,
    name: fileInfo.name,
    totalSize: fileInfo.totalSize,
  };

  const sm = await chatlib.getSocketMessage(JSON.stringify(uploadedData));
  socket.emit('fbroadcast', sm);
  /*
  let chunk = fileUploader.getChunk(fileId);

  let i = 0;
  let result = [];
  while (chunk.size) {
    const d = await chunk.arrayBuffer();
    const dd = chatlib.encryptFileData(d);
    result.push(dd);

    fileUploader.setChunkIndex(fileId, ++i);
    chunk= fileUploader.getChunk(fileId);
  }

  console.log(111);
  const b = new Blob(result);
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(b);

  const f = fileUploader.getFileInfo(fileId);
  link.download = f.name;

  document.body.appendChild(link);
  link.click();*/
}

async function sendChunk(fileId) {
  try {
    const fileInfo = fileUploader.getFileInfo(fileId);
    if (!fileInfo) {
      throw new Error('file not found');
    }

    const chunk = fileUploader.getChunk(fileId);
    let uploadData = null;
    if (chunk.size) {
      const d = await chunk.arrayBuffer();
      uploadData = chatlib.encryptFileData(d);
    } else {
      uploadData = 'end';
    }

    socket.emit(`f_${fileInfo.id}`, uploadData);
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
