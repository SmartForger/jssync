import { Router } from "express";
import { createChannel } from "./channel";
import { User } from "./types";
import { sendEncryptedResponse } from "./utils";

export function adminApiRoutes() {
  const router = Router();

  // Create client
  router.post("/channels", (req, res) => {
    const user = req.decryptedPayload as User;

    if (!user.username || !user.password) {
      res.status(400).send({
        error: "Invalid payload",
      });
      return;
    }

    const channel = createChannel(user);
    
    sendEncryptedResponse(res, req.nonce, 201, channel);
  });

  return router;
}
