import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import type { Express, Request, Response } from "express";
import indexRoutes from "./routes/index";

const app: Express = express();

app.use(cors());
app.use(express.json()); // parse JSON request bodies

app.use("/", indexRoutes);

const PORT: number = Number(process.env.PORT) || 8000;
app.listen(PORT, () => {
  console.log(`Server listening at port: ${PORT}`);
});

export default app;
