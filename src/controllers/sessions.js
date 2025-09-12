import prisma from "../config/db.js";
import { scrapeTableWithXPath } from "../services/scraper.js";

const url = "https://paris-02-2.hyperplanning.fr/hp/panneauinformations.html?id=PA3";
const xpath = "//*[@id='interfacePanneauInformations_objetPanneauInformation_donnees']//tr";

export async function scrapeAndSaveSessions(req, res) {
  try {
    const table = await scrapeTableWithXPath(url, xpath);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const savedSessions = [];

    for (const row of table) {
      // Ici tu peux mapper les colonnes correctement
      const [time, classroom, subject, teacher, promotion] = row;
      const startTime = time?.slice(0, 5) || "00:00";
      const endTime = time?.slice(5) || "00:00";

      const session = await prisma.session.upsert({
        where: { subject_date: { subject, date: today.toISOString().split("T")[0] } },
        update: {},
        create: {
          subject,
          teacher,
          promotion,
          classroom,
          date: today.toISOString().split("T")[0],
          startTime,
          endTime,
        },
      });

      savedSessions.push(session);
    }

    res.json({ message: "Sessions sauvegardées ✅", data: savedSessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTodaySessions(req, res) {
  const today = new Date().toISOString().split("T")[0];
  const sessions = await prisma.session.findMany({ where: { date: today } });
  res.json({ active: sessions });
}

export async function getTomorrowSessions(req, res) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sessions = await prisma.session.findMany({
    where: { date: tomorrow.toISOString().split("T")[0] },
  });

  res.json({ tomorrow: sessions });
}

export async function getArchiveSessions(req, res) {
  const today = new Date().toISOString().split("T")[0];
  const sessions = await prisma.session.findMany({
    where: { date: { lt: today } },
  });
  res.json({ archive: sessions });
}
