import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { chat, clearHistory, getHistory } from "../controllers/assistant.controller";

const router = Router();
router.use(authenticate);

router.post("/chat", chat);
router.get("/history/:projectSlug/:phaseId", getHistory);
router.delete("/history/:projectSlug/:phaseId", clearHistory);

export default router;
