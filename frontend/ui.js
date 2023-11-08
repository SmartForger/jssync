let selectedFile = null;

export function showLoginScreen(onSubmit) {
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

  formEl.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const displayname = document.getElementById("displayname").value;

    if (!username || !password || !displayname) {
      alert("Please fill in the form");
      return;
    }

    onSubmit({ username, password, displayname });
  });

  appContainer.appendChild(formEl);
}

export function showChatScreen(onSend) {
  const appContainer = document.getElementById("app");
  appContainer.innerHTML = "";

  const messages = document.createElement("div");
  messages.id = "messages";
  appContainer.appendChild(messages);

  const fileViewer = document.createElement('div');
  fileViewer.className = 'file-viewer';
  appContainer.appendChild(fileViewer);

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
    if (!inputEl.value && !selectedFile) {
      return;
    }

    await onSend({
      text: inputEl.value,
      file: selectedFile,
    });

    inputEl.value = "";
  });

  appContainer.appendChild(toolbar);


  const fileContainer = document.createElement('div');

  const fileInput = document.createElement('input');
  fileInput.type = "file";
  fileInput.className = "file-input";
  fileContainer.appendChild(fileInput);
  fileInput.onchange = (ev) => {
    selectFile(ev.target.files[0]);
  };

  const selectFileBtn = document.createElement("button");
  selectFileBtn.id = 'selectFileBtn';
  selectFileBtn.className = "primary-btn";
  selectFileBtn.innerText = "Select File";
  fileContainer.appendChild(selectFileBtn);

  selectFileBtn.addEventListener("click", () => {
    fileInput.value = null;
    fileInput.click();
  });

  toolbar.appendChild(fileContainer);
}

export function selectFile(file) {
  selectedFile = file;

  const fileView = document.querySelector('.file-viewer');
  if (fileView) {
    fileView.innerText = `File selected: ${selectedFile.name}`;
  }
}

export function uiStartSendingFile() {
  const fileView = document.querySelector('.file-viewer');
  if (fileView) {
    fileView.innerHTML = `<span>Sending file: ${selectedFile.name} </span><span id="upload_progress">(0.00%)</span>`;
  }

  const sendBtn = document.getElementById('send');
  sendBtn.disabled = true;
  sendBtn.innerText = 'Sending File';

  const selectFileBtn = document.getElementById('selectFileBtn');
  selectFileBtn.disabled = true;
}

export function uiUploadProgress(percent) {
  const progressEl = document.getElementById('upload_progress');
  if (progressEl) {
    progressEl.innerText = `(${percent.toFixed(2)}%)`;
  }
}

export function uiFinishSendingFile(filename) {
  const fileView = document.querySelector('.file-viewer');
  if (fileView) {
    fileView.innerText = `File sent: ${filename}`;
  }

  const sendBtn = document.getElementById('send');
  sendBtn.disabled = false;
  sendBtn.innerText = 'Send';

  const selectFileBtn = document.getElementById('selectFileBtn');
  selectFileBtn.disabled = false;
}

export function uiStartReceivingFile(filename) {
  const fileView = document.querySelector('.file-viewer');
  if (fileView) {
    fileView.innerHTML = `<span>Receiving file: ${filename}</span><span id="upload_progress">(0.00%)</span>`;
  }
}

export function uiFileReceived(filename, blob) {
  const fileView = document.querySelector('.file-viewer');
  if (fileView) {
    fileView.innerHTML = '<span>File received: </span>';

    const link = document.createElement('a');
    link.innerText = filename;
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    fileView.appendChild(link);
  }
}

export function addSystemMessage(msg) {
  const container = document.getElementById("messages");

  const msgEl = document.createElement("div");
  msgEl.className = "message system";
  msgEl.innerText = msg;

  container.appendChild(msgEl);
}

const pad2 = (n) => (n < 10 ? `0${n}` : n);

export function addMessage(username, msg) {
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
