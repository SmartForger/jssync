import { execSync } from "child_process";
import { RequestHandler } from "express";
import { aesDecrypt, decryptRSA, privateKeyPem } from "./cipher";

export const adminMiddleware: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const nonce = req.headers["sync_nonce"];
    const data = execSync(
      `keygen.exe check ${token} ${nonce} ${btoa(privateKeyPem)}`
    );
    if (data.toString("utf8").trim() === "true") {
      next();
    } else {
      res.status(401).send({ error: "unauthorized" });
    }
  } catch {
    res.status(500).send({
      error: "Server error",
    });
  }
};

export const nonceMiddleware: RequestHandler = (req, res, next) => {
  const headers = req.headers as {
    sync_nonce: string;
  };
  const nonce = decryptRSA(headers["sync_nonce"]);

  if (!nonce) {
    res.status(400).send({
      error: "Invalid payload",
    });
    return;
  }

  const decryptedPayload = aesDecrypt(req.body, nonce);
  req.decryptedPayload = JSON.parse(decryptedPayload);
  req.nonce = nonce;
  next();
};
