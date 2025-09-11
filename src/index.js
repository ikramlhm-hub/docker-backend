import express from "express";
import cors from "cors";
import cron from "node-cron";
import sessionsRoutes from "./routes/sessions.js";
import musicsRoutes from "./routes/musics.js";
import votesRoutes from "./routes/votes.js";
import { scrapeTableWithXPath } from "./services/scraper.js";
import prisma from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Brancher les routes principales
app.use("/sessions", sessionsRoutes);
app.use("/musics", musicsRoutes);
app.use("/votes", votesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend voting app is running 🚀" });
});

// ======================
// CRON : scraping auto
// ======================

// URL et XPath pour Hyperplanning
const url = "https://paris-02-2.hyperplanning.fr/hp/panneauinformations.html?id=PA3";
const xpath = "//*[@id='interfacePanneauInformations_objetPanneauInformation_donnees']//tr";

// Verrou pour éviter plusieurs scrapes en parallèle
let isScraping = false;

// Exécuter tous les jours à 8h du matin
cron.schedule("0 8 * * *", async () => {
  if (isScraping) {
    console.log("CRON déjà en cours, on skip...");
    return;
  }

  console.log("CRON: Scraping des sessions du jour...");
  isScraping = true;

  try {
    const table = await scrapeTableWithXPath(url, xpath);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const row of table) {
      const sessionName = row.join(" | ");
      await prisma.session.upsert({
        where: { name_date: { name: sessionName, date: today } }, // clé composite
        update: {}, 
        create: { name: sessionName, date: today },
      });
    }

    console.log("Sessions du jour sauvegardées (sans doublons)");
  } catch (err) {
    console.error("Erreur CRON:", err.message);
  } finally {
    isScraping = false;
  }
});

// ======================
// Lancement du serveur
// ======================
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.listen(PORT, () => {
  console.log(`[server]: running at http://localhost:${PORT}`);
});
