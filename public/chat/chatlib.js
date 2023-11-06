const ChatLib = ({ server = "" }) => {
  const STORAGE_KEY_AUTH = "auth";

  let client = {};
  let publicKey = "";

  async function getPublicKey() {
    if (publicKey) {
      return publicKey;
    }

    try {
      const res = await fetch(`${server}/api/_key`);
      const data = await res.json();

      publicKey = data.key;

      return data.key;
    } catch {
      return "";
    }
  }

  function login(data) {
    client = data;
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(client));

    return true;
  }

  function isLoggedIn() {
    return !!client.username;
  }

  function getClient() {
    return client;
  }

  async function loadLocalData() {
    const data = localStorage.getItem(STORAGE_KEY_AUTH);
    if (data) {
      client = JSON.parse(data);
    }
  }

  async function getSocketMessage(data) {
    const aesKey = forge.random.getBytesSync(32);
    const encryptedMsg = aesEncrypt(data, aesKey);

    const publicKey = await getPublicKey();
    const encryptedKey = rsaEncrypt(btoa(aesKey), publicKey);

    return { msg: encryptedMsg, key: encryptedKey };
  }

  loadLocalData();

  return {
    login,
    isLoggedIn,
    getClient,
    getPublicKey,
    getSocketMessage,
  };
};
