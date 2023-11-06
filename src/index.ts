import express, { Request, Response, Application } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { setupSocketIO } from "./socket";
import { apiRoutes } from "./api";
import { generateRSAKeys } from "./cipher";

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express and TypeScript Server");
});

app.use("/api", apiRoutes());

app.use(express.static("public"));

const httpServer = createServer(app);
setupSocketIO(httpServer);

generateRSAKeys(() => {
  httpServer.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
  });  
});
