import express, { Request, Response, Application } from "express";
import bodyParser from "body-parser";
import fs from 'fs';
import cors from "cors";
import { createServer } from "https";
import dotenv from "dotenv";
import { setupSocketIO } from "./socket";
import { apiRoutes } from "./api";
import { generateRSAKeys } from "./cipher";

declare global {
  namespace Express {
    export interface Request {
      decryptedPayload: object;
      nonce: string;
    }
  }
}

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.text());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express and TypeScript Server");
});

app.use("/api", apiRoutes());

app.use(express.static("public"));

const httpsServer = createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);
setupSocketIO(httpsServer);

generateRSAKeys(() => {
  httpsServer.listen(port, () => {
    console.log(`Server is Fire at https://localhost:${port}`);
  });
});
