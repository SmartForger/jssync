import { execSync } from 'child_process';
import { Router } from "express";
import { createChannel } from "./channel";
import { privateKeyPem } from './cipher';

export function adminApiRoutes() {
  const router = Router();

  // Admin middleware
  router.use((req, res, next) => {
    try {
      const token = req.headers.authorization;
      const nonce = req.headers['sync_nonce'];
      const data = execSync(`./sync-keygen adminsecret ${token} ${nonce} ${btoa(privateKeyPem)}`);
      console.log(111, `--${data}--`);
      next();
    } catch {
      res.status(500).send({
        error: 'Server error'
      });
    }
  });

  // Create client
  router.post("/clients", (req, res) => {
    const username = req.body.username as string;
    const password = req.body.password as string;
    if (!username || !password) {
      res.status(400).send({
        error: "Invalid payload",
      });
      return;
    }

    const channel = createChannel({
      username,
      password,
    });

    res.status(201).json(channel);
  });

  return router;
}
