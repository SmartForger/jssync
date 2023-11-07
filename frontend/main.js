import { chatlib } from "./chatlib";
import {
  addMessage,
  addSystemMessage,
  showChatScreen,
  showLoginScreen,
} from "./ui";

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
}

async function loginHandler(data) {
  const isLoggedin = await chatlib.login(data);

  if (isLoggedin) {
    showChatScreen(sendMessage);
    initSocketIO();
  }
}

async function sendMessage(text) {
  if (socket) {
    const data = JSON.stringify({
      username: chatlib.getDisplayName(),
      message: text,
    });

    socket.emit("broadcast", await chatlib.getSocketMessage(data));
    addMessage(chatlib.getDisplayName(), text);
  }
}

async function init() {
  await chatlib.loadLocalData();

  if (chatlib.isLoggedIn()) {
    showChatScreen(loginHandler);
    initSocketIO();
  } else {
    showLoginScreen(sendMessage);
  }
}

init();
