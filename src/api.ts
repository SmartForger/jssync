import { Router } from "express";
import { adminApiRoutes } from "./admin";
import forge from "node-forge";
import { publicKey } from "./cipher";

export function apiRoutes() {
  const router = Router();

  router.post("/login", (_, res) => {
    res.send("login ok");
  });

  router.get("/_key", (_, res) => {
    res.send({ key: publicKey ? forge.pki.publicKeyToPem(publicKey) : "" });
  });

  router.use("/admin", adminApiRoutes());

  return router;
}
