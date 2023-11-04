import { Router } from "express";

export function adminApiRoutes() {
  const router = Router();

  // Create client
  router.post("/clients", (_, res) => {
    res.send("create client");
  });

  return router;
}
