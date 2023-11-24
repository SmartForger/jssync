import forge from "node-forge";

let publicKey: forge.pki.rsa.PublicKey | null = null;
let privateKey: forge.pki.rsa.PrivateKey | null = null;
let privateKeyPem = "";

export const generateRSAKeys = (onSuccess: () => void) => {
  /** For development */
  publicKey = forge.pki.publicKeyFromPem(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzPob62+Jz6NeYgl/7lMW
x43VXPAMWOxNAmGU+c1dL1tbeuP4UI+BMB3RGKc9vD+TOFU8oh/SXNkl9Gi422hH
CMe47SFDLuMDXGMA19AmCeA2s4JMk2YCaMzfdEy3poOXnK33bErSZqmcnCBoJAWN
97grkn7Dqg49Vlhv/jnSv47hSJCAeUcWz5l/fQIZuVKzfXN2gXl3gVTziuvn3Zyk
0U1VJMZ5GDC/hZmzTBleSra0G4citMMjJMHvYua0jvx1iQm4SYigOBMOSSRFq3dE
qLbBXItbJi+KgOaxAl0ufu+Qf+My+UupG7sihXpDxaFIkzlEqCDVMGNemGy01WHU
zwIDAQAB
-----END PUBLIC KEY-----`);
  privateKeyPem = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAzPob62+Jz6NeYgl/7lMWx43VXPAMWOxNAmGU+c1dL1tbeuP4
UI+BMB3RGKc9vD+TOFU8oh/SXNkl9Gi422hHCMe47SFDLuMDXGMA19AmCeA2s4JM
k2YCaMzfdEy3poOXnK33bErSZqmcnCBoJAWN97grkn7Dqg49Vlhv/jnSv47hSJCA
eUcWz5l/fQIZuVKzfXN2gXl3gVTziuvn3Zyk0U1VJMZ5GDC/hZmzTBleSra0G4ci
tMMjJMHvYua0jvx1iQm4SYigOBMOSSRFq3dEqLbBXItbJi+KgOaxAl0ufu+Qf+My
+UupG7sihXpDxaFIkzlEqCDVMGNemGy01WHUzwIDAQABAoIBABqzZdmoYOJMXKoW
pLSN3ETIZAfEOUeIGIv73CUiLEZT9zmt4pXT67cx2yAEARW5jlrjN4/C52sy2i/Z
SGNEVSR+p8cz8wVziueI+f4i3iGhNF7z1TfKLPwr29vRdobZU3GUc8uGf5vh8kWg
LxCqLJEdS4e8vY40ZqcNxCDwtVRAc8RE7r/V1O1dy3X5LQD1vroOOQUaAslIFicZ
zE9jr9dJBduHngaUtn8FzBnQyRmVZlhutor57RrVMzQui2vibdUxqHvOI96Zysfe
dQFXEs8TDIcvoYNKDShv5hUlN6aWpGJEpA+Nd0dcRVHRwq17N4w/YOp4HxwO/UNF
J6NTkYECgYEA6k+3JdYDXIaxPuJmveKjXa6SaYzw+e/rrQAPgp4kXc/U/0SZNMU3
PnVILK+3E7o7Z5gqXKdlPLnj6sTCKA4k+NoeYzxBC8dE/a00YUZfUwnlaIeDajX0
tnTwUSapGof5JHvM0o5e4YfI4uUPP1HTzO7FgfnSuIG7ib5UtOtnhA8CgYEA3/NH
y8k9pbzYg6l9yslwKWc3FNUECnBPLHpellTKb2Yza7g/7qUd/wR+pxk5RXxJCugH
AuAaKCBewGpkfkbKioTFzEv2xjoeW+MPM9Y7iLiUuZfxR6nc9InBs5S3Bdi6DwdT
RUYGZMaMTUxNQVlTw6//2vmaBaWRCBeVtVoA40ECgYEAlR3eROoKgZwGuSqEkFvn
8/rhmuLjiWyy5Aqh1FKoejuGJl6V0guguNMS971sGdXvcGJas1SlDRyQfBx0I+G8
jdLie+0gyEotEfRk3XNXvxURNpDnhXSJJIUPW9Xq0MOwPxO6qlWI9KbhpeR466c7
z7Q1Zh6DiICnxWWnquwVmOkCgYAytsvmaR8NvjMltacn2fANYDNIA2kT2BUF1HxA
/NiO24z/csz/hOLDEkiAHKUsiBWeY6baztb9iT8LwcwaEHvjXGfSeM1cXGLtmgCi
U3xN3MbJNJBOEzhXJC76NM4xg7+2kYkY4d+myJOTGZlRGCJw6RU+iFGJv9GVDIo5
dDVJQQKBgQCiTOXIFTsyMHA/gMwRACOMv/6BEB9Mq10lDbk2ZTLjTmUktuKEeMfr
7jT80bC5z5ikK2jfaQRamFA8DTh9vU5a/T0Gq65EWwI9jMwgzRQ0ecdotcDo1NHI
hvTjn6/LsHUSdFkF5kUrc3MSo+Xci3zG3NhGLsCgM1K9AQQy/rBn1Q==
-----END RSA PRIVATE KEY-----`;
  privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  onSuccess();

  /** For production */
  /*forge.pki.rsa.generateKeyPair(
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
  );*/
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
