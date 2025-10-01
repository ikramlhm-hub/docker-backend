import { chromium } from "playwright";
import prisma from "../config/prisma.js";

/**
 * Convertit une chaîne d'horaires comme "09h0012h30" en ["09:00", "12:30"]
 */
function parseHour(hourStr) {
  const match = hourStr.match(/(\d{1,2})h(\d{2})(\d{1,2})h(\d{2})/);
  if (!match) return ["00:00", "00:00"];
  const [, h1, m1, h2, m2] = match;
  return [`${h1.padStart(2, "0")}:${m1}`, `${h2.padStart(2, "0")}:${m2}`];
}

/**
 * ✅ Corrige la date pour qu'elle soit fixée à minuit locale,
 * puis convertie proprement en UTC pour éviter le décalage de -2h.
 */
function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
}

/**
 * 🕷️ Scrap les sessions Hyperplanning et insère/met à jour en base
 */
export async function scrapAndUpsertSessions(url, xpathRows) {
  console.log("📡 Lancement du scraping sur:", url);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    console.log("✅ Page chargée");

    const rows = await page.locator(`xpath=${xpathRows}`).elementHandles();
    console.log(`${rows.length} lignes trouvées`);

    for (const row of rows.slice(1)) { // ignore l'entête
      const cells = await row.$$("td");
      if (cells.length < 5) continue;

      const texts = [];
      for (const c of cells) {
        const t = (await c.textContent())?.trim() || "";
        texts.push(t);
      }

      const hour = texts[0] || "00h0000h00";
      const classroom = texts[1] || "Unknown";
      const subject = texts[2] || "Unknown";
      const teacher = texts[3] || "Unknown";
      const promotion = texts[4] || "Unknown";

      const [startTime, endTime] = parseHour(hour);
      const date = normalizeDate(new Date()); // ✅ date corrigée

      console.log("📝 Données préparées pour Prisma:", {
        subject,
        teacher,
        promotion,
        classroom,
        date,
        startTime,
        endTime
      });

      try {
        await prisma.session.upsert({
          where: {
            session_unique: { subject, date }
          },
          update: {
            teacher,
            promotion,
            classroom,
            startTime,
            endTime
          },
          create: {
            subject,
            teacher,
            promotion,
            classroom,
            date,
            startTime,
            endTime
          }
        });
        console.log(`✅ Session ${subject} (${date.toISOString().split("T")[0]}) insérée ou mise à jour`);
      } catch (err) {
        console.error("❌ Erreur Prisma:", err.message);
      }
    }
  } catch (err) {
    console.error("❌ Erreur scraping:", err);
  } finally {
    await browser.close();
    console.log("🚪 Navigateur fermé");
  }
}

/**
 * 🧪 Exécution directe si on lance ce fichier avec "node src/services/scraping.js"
 */
if (process.argv[1].includes("scraping.js")) {
  const url = "https://paris-02-2.hyperplanning.fr/hp/panneauinformations.html?id=PA3";
  const xpath = "//*[@id='interfacePanneauInformations_objetPanneauInformation_donnees']//tr";

  scrapAndUpsertSessions(url, xpath)
    .then(() => {
      console.log("✅ Scraping terminé !");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Erreur lors du scraping:", err);
      process.exit(1);
    });
}
