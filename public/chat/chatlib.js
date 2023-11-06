const ChatLib = ({ server = "" }) => {
  const STORAGE_KEY_AUTH = "auth";
  const STORAGE_KEY_DISPLAYNAME = "displayname";

  let channel = {};
  let displayname = '';
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
      channel = JSON.parse(payload);
      displayname = data.displayname;

      const authData = {
        k1: publicKey,
        k2: btoa(nonce),
        d: responseData
      }
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authData));
      localStorage.setItem(STORAGE_KEY_DISPLAYNAME, data.displayname);

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

  function getDisplayName() {
    return displayname;
  }

  async function loadLocalData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUTH);
      displayname = localStorage.getItem(STORAGE_KEY_DISPLAYNAME);

      if (data) {
        const authInfo = JSON.parse(data);
        const pkey = await getPublicKey();
        if (!authInfo.k1 || authInfo.k1 !== pkey) {
          return;
        }

        const nonce = atob(authInfo.k2);
        const d = aesDecrypt(authInfo.d, nonce);
        channel = JSON.parse(d);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function getSocketMessage(data) {
    const aesKey = forge.random.getBytesSync(32);
    const encryptedMsg = aesEncrypt(data, aesKey);

    const publicKey = await getPublicKey();
    const encryptedKey = rsaEncrypt(btoa(aesKey), publicKey);

    return { msg: encryptedMsg, key: encryptedKey };
  };

  return {
    login,
    isLoggedIn,
    getChannel,
    getDisplayName,
    getPublicKey,
    getSocketMessage,
    loadLocalData,
  };
};
