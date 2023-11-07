const lib = ChatLib({});

let socket = null;

function initSocketIO() {
  socket = io();

  socket.on("connect", () => {
    const channel = lib.getChannel();
    socket.emit("join", channel.id);
    console.log("Connected to server");
  });

  socket.on("joined", (msg) => {
    addSystemMessage(`Joined room: "${msg}"`);
  });

  socket.on("receive", async (data) => {
    const decrypted = lib.decryptSocketResponse(data);
    addMessage(decrypted.username, decrypted.message);
  });
}

async function loginHandler(data) {
  const isLoggedin = await lib.login(data);

  if (isLoggedin) {
    showChatScreen(sendMessage);
    initSocketIO();
  }
}

async function sendMessage(text) {
  if (socket) {
    const data = JSON.stringify({
      username: lib.getDisplayName(),
      message: text,
    });

    socket.emit("broadcast", await lib.getSocketMessage(data));
    addMessage(lib.getDisplayName(), text);
  }
}

async function init() {
  await lib.loadLocalData();

  if (lib.isLoggedIn()) {
    showChatScreen(loginHandler);
    initSocketIO();
  } else {
    showLoginScreen(sendMessage);
  }
}

init();
