import express from "express";
import cors from "cors";
import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";

import sessionsRoutes from "./routes/sessions.js";
import musicsRoutes from "./routes/tracks.js";
import votesRoutes from "./routes/votes.js";
import scrapeRouter from "./routes/scrape.js";  // ✅ une seule fois

import prisma from "./config/db.js";
import { scrapeTableWithXPath } from "./services/scraper.js";

const app = express();   // ✅ crée l’app AVANT d’utiliser app.use
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes API
app.use("/sessions", sessionsRoutes);
app.use("/musics", musicsRoutes);
app.use("/votes", votesRoutes);
app.use("/scrape", scrapeRouter);  // ✅ après avoir déclaré app

// Frontend statique
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Lancement serveur
app.listen(PORT, () => {
  console.log(`[server]: running at http://localhost:${PORT}`);
});
