import { Router } from "express";
import type { Request, Response } from "express";
import { identifyContact } from "../controllers/contactController";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
router.post("/identify", identifyContact);

export default router;
