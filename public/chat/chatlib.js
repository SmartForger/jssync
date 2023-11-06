const ChatLib = ({ server = "" }) => {
  const STORAGE_KEY_AUTH = "auth";

  let channel = {};
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

  function generateNonce(publicKey) {
    const nonce = forge.random.getBytesSync(32);
    const encryptedText = rsaEncrypt(btoa(nonce), publicKey);

    return {
      nonce,
      encrypted: encryptedText,
    };
  }

  async function login(data) {
    try {
      const publicKey = await getPublicKey();
      const { nonce, encrypted } = generateNonce(publicKey);
      const encryptedData = aesEncrypt(
        JSON.stringify({
          username: data.username,
          password: data.password,
        }),
        nonce
      );

      const resp = await fetch(`${server}/api/login`, {
        method: "POST",
        body: encryptedData,
        headers: {
          sync_nonce: encrypted,
        },
      });

      const responseData = await resp.text();
      if (!resp.ok) {
        throw {
          status: resp.status,
          data: responseData,
        };
      }

      const payload = aesDecrypt(responseData, nonce);

      const channel = JSON.parse(payload);
      const authData = {
        id: channel.id,
        secret: channel.secret,
        displayname: data.displayname,
      };

      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authData));

      return true;
    } catch (e) {
      console.error(e);
    }

    return false;
  }

  function isLoggedIn() {
    return !!channel.id;
  }

  function getChannel() {
    return channel;
  }

  async function loadLocalData() {
    const data = localStorage.getItem(STORAGE_KEY_AUTH);
    if (data) {
      channel = JSON.parse(data);
      console.log(111, channel)
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
    getChannel,
    getPublicKey,
    getSocketMessage,
  };
};
