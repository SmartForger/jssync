/**
 *
 * @param {string} data Base64 data string
 * @param {string} publicKey PEM format public key
 * @returns {string}
 */
export function rsaEncrypt(data, publicKey) {
  const rsapub = forge.pki.publicKeyFromPem(publicKey);
  const encryptedText = rsapub.encrypt(
    forge.util.encodeUtf8(data),
    "RSA-OAEP",
    {
      md: forge.md.sha256.create(),
    }
  );

  return btoa(encryptedText);
}

/**
 *
 * @param {string} data data string
 * @param {byte[]} key 32 byte array aes key
 * @returns Base64 string
 */
export function aesEncrypt(data, key) {
  const iv = forge.random.getBytesSync(32);
  const cipher = forge.cipher.createCipher("AES-GCM", key);
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(data));
  cipher.finish();

  return btoa(iv + cipher.output.data + cipher.mode.tag.data);
}

/**
 *
 * @param {string} data Base64 string
 * @param {byte[]} key 32 byte array aes key
 * @returns
 */
export function aesDecrypt(data, key) {
  const encrypted = atob(data);

  const iv = encrypted.slice(0, 32);
  const tag = encrypted.slice(-16);
  const ciphertext = encrypted.slice(32, -16);
  const decipher = forge.cipher.createDecipher("AES-GCM", key);
  decipher.start({ iv: iv, tagLength: 128, tag });
  decipher.update(forge.util.createBuffer(ciphertext));
  decipher.finish();

  return decipher.output.data;
}
