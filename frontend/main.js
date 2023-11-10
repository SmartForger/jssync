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

  socket.on("f_ack", async (data) => {
    const fileInfo = chatlib.decryptSocketResponse(data);

    const ackHandler = (data) => {
      const index = +chatlib.decryptData(data);

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

  socket.on('freceive', async (data) => {
    const fileInfo = chatlib.decryptSocketResponse(data);

    console.log('freceive', fileInfo);

    fileUploader.startReceiving(fileInfo.id, fileInfo.name, fileInfo.totalSize);
    uiStartReceivingFile(fileInfo.id, fileInfo.name);

    sendFileInfo(fileInfo.id, false);
  });

  socket.on("f_response", (data) => {
    const fileInfo = chatlib.decryptSocketResponse(data);

    const fileResponseHandler = (data) => {
      const decrypted = chatlib.decryptFileData(data);
      const hasMore = fileUploader.receiveChunk(fileInfo.id, decrypted);
      sendFileReceiveRequest(fileInfo.id, hasMore);

      if (!hasMore) {
        socket.off(`f_res_${fileInfo.id}`, fileResponseHandler);
        const f = fileUploader.getFileInfo(fileInfo.id);
        if (f) {
          const b = new Blob(f.data, { type: "octet/stream" });
          uiFileReceived(fileInfo.id, fileInfo.name, b);
        }
      } else {
        uiSetFileProgress(fileInfo.id, fileUploader.getUploadProgress(fileInfo.id));
      }
    }
    socket.on(`f_res_${fileInfo.id}`, fileResponseHandler);

    sendFileReceiveRequest(fileInfo.id);
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
        uiStartSendingFile(f.id, f.name);
        sendFileInfo(f.id);
      }
    }
  }
}

async function sendFileInfo(fileId, isUpload = true) {
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
  socket.emit(isUpload ? 'fbroadcast' : 'f_request', sm);
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

async function sendFileReceiveRequest(fileId) {
  const fileInfo = fileUploader.getFileInfo(fileId);
  if (fileInfo) {
    const encrypted = await chatlib.getSocketMessage(fileInfo.chunkIndex.toString());
    socket.emit(`f_req_${fileInfo.id}`, encrypted);
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
