import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

import authRouter from "./controllers/auth.js";
import sessionsRouter from "./controllers/sessions.js";
import tracksRouter from "./controllers/tracks.js";
import votesRouter from "./controllers/votes.js";
import usersRouter from "./controllers/users.js";
import { scheduleDailyScraper } from "./jobs/scraper.js";
import prisma from "./config/prisma.js";
import { scrapAndUpsertSessions } from "./services/scraping.js";

// ======================
// Config serveur
// ======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Routes API
app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/tracks", tracksRouter);
app.use("/api/votes", votesRouter);
app.use("/api/users", usersRouter);

// Frontend (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ======================
// Lancement du serveur
// ======================
app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  // Scraping initial au démarrage
  const url = "https://paris-02-2.hyperplanning.fr/hp/panneauinformations.html?id=PA3";
  const xpath = "//*[@id='interfacePanneauInformations_objetPanneauInformation_donnees']//tr";

  try {
    await scrapAndUpsertSessions(url, xpath);
    console.log(" Scraping DONE !");
  } catch (err) {
    console.error("Scraping failed:", err);
  }

  // Cron job quotidien
  scheduleDailyScraper();
});
