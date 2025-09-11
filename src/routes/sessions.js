import express from "express";
import { scrapeTableWithXPath } from "../services/scraper.js";
import prisma from "../config/db.js";

const router = express.Router();

const url = "https://paris-02-2.hyperplanning.fr/hp/panneauinformations.html?id=PA3";
const xpath = "//*[@id='interfacePanneauInformations_objetPanneauInformation_donnees']//tr";

//Scraper et sauvegarder en DB
router.get("/scrape", async (req, res) => {
  try {
    const table = await scrapeTableWithXPath(url, xpath);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const savedSessions = [];

    for (const row of table) {
      const sessionName = row.join(" | ");

      const session = await prisma.session.upsert({
        where: { name_date: { name: sessionName, date: today } }, // clé composite
        update: {}, // ne fait rien si déjà présent
        create: { name: sessionName, date: today },
      });

      savedSessions.push(session);
    }

    res.json({ message: "Sessions sauvegardées ✅", data: savedSessions });
  } catch (err) {
    console.error("❌ Erreur dans /sessions/scrape:", err);
    res.status(500).json({ error: err.message });
  }
});

//Sessions du jour
router.get("/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const sessions = await prisma.session.findMany({
      where: { date: { gte: today, lt: tomorrow } },
    });

    res.json({ active: sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Sessions de demain
router.get("/tomorrow", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(today.getDate() + 2);

    const sessions = await prisma.session.findMany({
      where: { date: { gte: tomorrow, lt: afterTomorrow } },
    });

    res.json({ tomorrow: sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Archives
router.get("/archive", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await prisma.session.findMany({
      where: { date: { lt: today } },
    });

    res.json({ archive: sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
