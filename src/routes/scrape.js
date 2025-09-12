import express from "express";
import { scrapeTableWithXPath } from "../services/scraper.js";
import prisma from "../config/db.js";

const router = express.Router();

const url = "https://paris-02-2.hyperplanning.fr/hp/panneauinformations.html?id=PA3";
const xpath = "//*[@id='interfacePanneauInformations_objetPanneauInformation_donnees']//tr";

router.get("/", async (req, res) => {
  try {
    const table = await scrapeTableWithXPath(url, xpath);
    const today = new Date().toISOString().split("T")[0];

    const savedSessions = [];

    for (const row of table) {
      const [time, classroom, subject, teacher, promotion] = row;

      // Extraire horaires
      let startTime = "00:00";
      let endTime = "00:00";
      if (time && time.includes("-")) {
        const [start, end] = time.split("-");
        startTime = start?.replace("h", ":") || "00:00";
        endTime = end?.replace("h", ":") || "00:00";
      }

      const session = await prisma.session.upsert({
        where: { subject_date: { subject, date: today } }, // ⚡ nécessite @@unique([subject,date]) dans schema.prisma
        update: {},
        create: {
          subject,
          teacher,
          promotion,
          classroom,
          date: today,
          startTime,
          endTime,
        },
      });

      savedSessions.push(session);
    }

    res.json({ message: "Sessions sauvegardées ✅", data: savedSessions });
  } catch (err) {
    console.error("❌ Erreur scraping:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
