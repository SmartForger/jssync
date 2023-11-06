import { Router } from "express";
import { adminApiRoutes } from "./admin";
import forge from "node-forge";
import { publicKey } from "./cipher";
import { adminMiddleware, nonceMiddleware } from "./middlewares";
import { getChannel } from "./channel";
import { User } from "./types";
import { sendEncryptedResponse } from "./utils";

export function apiRoutes() {
  const router = Router();

  router.post("/login", nonceMiddleware, (req, res) => {
    const channel = getChannel(req.decryptedPayload as User);

    if (!channel) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    sendEncryptedResponse(res, req.nonce, 200, channel);
  });

  router.get("/_key", (_, res) => {
    res.send({ key: publicKey ? forge.pki.publicKeyToPem(publicKey) : "" });
  });

  router.use("/admin", nonceMiddleware, adminMiddleware, adminApiRoutes());

  return router;
}
