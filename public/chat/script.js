function initSocketIO() {
  const socket = io();

  socket.on('connect', () => {
    console.log('Connected to server');
  });
}

initSocketIO();
