const ChatLib = ({ server = "" }) => {
  const STORAGE_KEY_AUTH = "auth";

  let client = {};

  function login(data) {
    client = data;
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(client));

    return true;
  };

  function isLoggedIn() {
    return !!client.username;
  };

  function getClient() {
    return client;
  }

  async function loadLocalData() {
    const data = localStorage.getItem(STORAGE_KEY_AUTH);
    if (data) {
      client = JSON.parse(data);
    }
  }

  loadLocalData();

  return {
    login,
    isLoggedIn,
    getClient,
  };
};
