import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import type { Express, Request, Response } from "express";

const app: Express = express();

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
  return;
});

const PORT: number = Number(process.env.PORT) || 8000;
app.listen(PORT, () => {
  console.log(`Server listening at port: ${PORT}`);
});

export default app;
