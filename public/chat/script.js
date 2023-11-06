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
    addMessage(data.username, data.message);
  });
}

function showLoginScreen() {
  const appContainer = document.getElementById("app");
  appContainer.innerHTML = "";

  const formEl = document.createElement("form");
  formEl.id = "loginform";
  formEl.innerHTML = `
<div>
  <label for="username">Username</label>
  <input id="username" class="input" placeholder="Enter Username">
</div>
<div>
  <label for="password">Password</label>
  <input id="password" class="input" type="password" placeholder="Enter Password">
</div>
<div>
  <label for="displayname">Display Name</label>
  <input id="displayname" class="input" placeholder="Enter Display Name">
</div>
<input class="primary-btn" type="submit" value="Log In">
`;

  formEl.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const isLoggedin = await lib.login({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      displayname: document.getElementById("displayname").value,
    });

    if (isLoggedin) {
      showChatScreen();
      initSocketIO();
    }
  });

  appContainer.appendChild(formEl);
}

function showChatScreen() {
  const appContainer = document.getElementById("app");
  appContainer.innerHTML = "";

  const messages = document.createElement("div");
  messages.id = "messages";
  appContainer.appendChild(messages);

  const toolbar = document.createElement("div");
  toolbar.id = "toolbar";

  const inputEl = document.createElement("textarea");
  inputEl.id = "input";
  inputEl.className = "input";
  toolbar.appendChild(inputEl);

  const sendBtn = document.createElement("button");
  sendBtn.id = "send";
  sendBtn.className = "primary-btn";
  sendBtn.innerText = "Send";
  toolbar.appendChild(sendBtn);

  sendBtn.addEventListener("click", async () => {
    if (!inputEl.value) {
      return;
    }

    if (socket) {
      const data = JSON.stringify({
        username: lib.getDisplayName(),
        message: inputEl.value,
      });

      socket.emit("broadcast", await lib.getSocketMessage(data));
      addMessage(lib.getDisplayName(), inputEl.value);
      inputEl.value = "";
    }
  });

  appContainer.appendChild(toolbar);
}

function addSystemMessage(msg) {
  const container = document.getElementById("messages");

  const msgEl = document.createElement("div");
  msgEl.className = "message system";
  msgEl.innerText = msg;

  container.appendChild(msgEl);
}

const pad2 = (n) => (n < 10 ? `0${n}` : n);

function addMessage(username, msg) {
  const container = document.getElementById("messages");

  const now = new Date();
  const h = now.getHours();
  let hh = h % 12;
  hh = hh === 0 ? 12 : hh;
  const timeStr = `${pad2(hh)}:${pad2(now.getMinutes())} ${
    h >= 12 ? "pm" : "am"
  }`;

  const msgEl = document.createElement("div");
  msgEl.className = "message";
  msgEl.innerHTML = `
  <div class="info">
    <span class="username">${username}</span>
    <span class="time">${timeStr}</span>
  </div>
  `;

  const textEl = document.createElement("pre");
  textEl.className = "text";
  textEl.innerHTML = msg;
  msgEl.appendChild(textEl);

  container.appendChild(msgEl);
}

async function init() {
  await lib.loadLocalData();

  if (lib.isLoggedIn()) {
    showChatScreen();
    initSocketIO();
  } else {
    showLoginScreen();
  }
}

init();
