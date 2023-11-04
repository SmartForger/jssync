const lib = ChatLib({});

function initSocketIO() {
  const socket = io();

  socket.on("connect", () => {
    console.log("Connected to server");
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
<input class="primary-btn" type="submit" value="Log In">
`;

  formEl.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const isLoggedin = lib.login({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
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

    inputEl.value = "";
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

function addMessage(msg) {
  const container = document.getElementById("messages");

  const now = new Date();
  const h = now.getHours();
  const timeStr = `${h % 12}:${now.getMinutes()} ${h >= 12 ? "pm" : "am"}`;

  const msgEl = document.createElement("div");
  msgEl.className = "message";
  msgEl.innerHTML = `
  <div class="time">${timeStr}</div>
  <div class="text">${msg}</div>
  `;

  container.appendChild(msgEl);
}

function init() {
  if (lib.isLoggedIn()) {
    showChatScreen();
    initSocketIO();
  } else {
    showLoginScreen();
  }
}

init();
