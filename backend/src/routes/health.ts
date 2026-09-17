import { Router, Request, Response } from "express";
import { getHealth } from "../controllers/healthController";

const router = Router();

router.get("/", getHealth);

export default router;
