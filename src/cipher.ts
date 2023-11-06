import forge from "node-forge";

let publicKey: forge.pki.rsa.PublicKey | null = null;
let privateKey: forge.pki.rsa.PrivateKey | null = null;
let privateKeyPem = '';

export const generateRSAKeys = (onSuccess: () => void) => {
  forge.pki.rsa.generateKeyPair(
    {
      bits: 2048,
      e: 0x10001,
    },
    (e, keypair) => {
      publicKey = keypair.publicKey;
      privateKey = keypair.privateKey;
      privateKeyPem = forge.pki.privateKeyToPem(privateKey);

      onSuccess();
    }
  );
};

export function decryptRSA(encrypted: string) {
  const decryptedData = privateKey?.decrypt(atob(encrypted), "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  return decryptedData;
}

/**
 *
 * @param {string} data data string
 * @param {string} key base64 string of 32 bytes
 * @returns Base64 string
 */
export function aesEncrypt(data: string, key: string) {
  const iv = forge.random.getBytesSync(32);
  const cipher = forge.cipher.createCipher("AES-GCM", atob(key));
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(data));
  cipher.finish();

  return btoa(iv + cipher.output.data + cipher.mode.tag.data);
}

/**
 *
 * @param {string} data Base64 string
 * @param {string} key base64 string of 32 bytes
 * @returns
 */
export function aesDecrypt(data: string, key: string) {
  const encrypted = atob(data);

  const iv = encrypted.slice(0, 32);
  const tag = encrypted.slice(-16);
  const ciphertext = encrypted.slice(32, -16);
  const decipher = forge.cipher.createDecipher("AES-GCM", atob(key));
  decipher.start({ iv: iv, tagLength: 128, tag: forge.util.createBuffer(tag) });
  decipher.update(forge.util.createBuffer(ciphertext));
  decipher.finish();

  return decipher.output.data;
}

export { publicKey, privateKey, privateKeyPem };
