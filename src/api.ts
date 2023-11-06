import { Router } from "express";
import { adminApiRoutes } from "./admin";
import forge from "node-forge";
import { publicKey } from "./cipher";
import { adminMiddleware, nonceMiddleware } from "./middlewares";

export function apiRoutes() {
  const router = Router();

  router.post("/login", nonceMiddleware, (_, res) => {
    res.send("login ok");
  });

  router.get("/_key", (_, res) => {
    res.send({ key: publicKey ? forge.pki.publicKeyToPem(publicKey) : "" });
  });

  router.use("/admin", nonceMiddleware, adminMiddleware, adminApiRoutes());

  return router;
}
