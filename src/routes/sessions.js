import express from "express";
import { scrapeAndSaveSessions, getTodaySessions, getTomorrowSessions, getArchiveSessions } from "../controllers/sessions.js";

const router = express.Router();

router.get("/scrape", scrapeAndSaveSessions);
router.get("/today", getTodaySessions);
router.get("/tomorrow", getTomorrowSessions);
router.get("/archive", getArchiveSessions);

export default router;
