import { Response } from "express";
import { aesEncrypt } from "./cipher";

export const sendEncryptedResponse = (
  res: Response,
  secret: string,
  status: number,
  data: object
) => {
  const encryptedText = aesEncrypt(JSON.stringify(data), secret);

  res.status(status).send(encryptedText);
};
