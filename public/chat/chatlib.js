const ChatLib = ({ server = "" }) => {
  const STORAGE_KEY_CHANNEL = "channel";

  let client = {};

  const login = (data) => {
    client = data;
    localStorage.setItem(STORAGE_KEY_CHANNEL, data.username);

    return true;
  };

  const isLoggedIn = () => {
    return !!client.username;
  };

  async function loadLocalData() {
    const channel = localStorage.getItem(STORAGE_KEY_CHANNEL);
    client = {
      username: channel || "",
    };
  }

  loadLocalData();

  return {
    login,
    isLoggedIn,
  };
};
