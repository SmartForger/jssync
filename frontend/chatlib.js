import { rsaEncrypt, aesDecrypt, aesEncrypt, aesEncryptRaw, aesDecryptRaw } from "./cipher";

export const ChatLib = ({ server = "" }) => {
  const STORAGE_KEY_AUTH = "auth";
  const STORAGE_KEY_DISPLAYNAME = "displayname";

  let channel = {};
  let displayname = "";
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
      const {
        data: ch,
        nonce,
        responseData,
      } = await apiRequest(`${server}/api/login`, {
        username: data.username,
        password: data.password,
      });

      channel = ch;
      displayname = data.displayname;

      const authData = {
        k1: publicKey,
        k2: btoa(nonce),
        d: responseData,
      };
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

        const { data: response } = await apiRequest(
          `${server}/api/haschannel`,
          {
            cid: channel.id,
          }
        );
        if (!response.haschannel) {
          channel = {};
        }
      }
    } catch (e) {
      channel = {};
      console.error(e);
    }
  }

  async function apiRequest(url, dataObj) {
    const publicKey = await getPublicKey();
    const { nonce, encrypted } = generateNonce(publicKey);
    const encryptedData = aesEncrypt(JSON.stringify(dataObj), nonce);

    const resp = await fetch(url, {
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
    return {
      data: JSON.parse(payload),
      nonce,
      responseData,
    };
  }

  async function getSocketMessage(data) {
    const encryptedMsg = aesEncrypt(data, atob(channel.secret));
    const publicKey = await getPublicKey();
    const cid = rsaEncrypt(channel.id, publicKey);

    return { t: encryptedMsg, c: cid };
  }

  function encryptData(data) {
    return aesEncrypt(data, atob(channel.secret));
  }

  function decryptData(data) {
    return aesDecrypt(data, atob(channel.secret));
  }

  function decryptSocketResponse(data) {
    const decrypted = decryptData(data);
    return JSON.parse(decrypted);
  }

  function encryptFileData(arraybuffer) {
    const data = new Uint8Array(arraybuffer);
    return aesEncryptRaw(data, atob(channel.secret));
  }

  function decryptFileData(data) {
    const decrypted = aesDecryptRaw(data, atob(channel.secret));
    return Uint8Array.from(decrypted, (c) => c.charCodeAt(0));
  }

  return {
    login,
    isLoggedIn,
    getChannel,
    getDisplayName,
    getPublicKey,
    getSocketMessage,
    loadLocalData,
    encryptData,
    decryptData,
    decryptSocketResponse,
    encryptFileData,
    decryptFileData,
  };
};

export const chatlib = ChatLib(chatlibConfig);
