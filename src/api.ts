import { Router } from "express";
import { adminApiRoutes } from "./admin";

export function apiRoutes() {
  const router = Router();

  router.post("/login", (_, res) => {
    res.send("login ok");
  });

  router.use("/admin", adminApiRoutes());

  return router;
}
