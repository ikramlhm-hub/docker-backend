import { chromium } from "playwright";
import prisma from "../config/prisma.js";

function parseHour(hourStr) {
  const match = hourStr.match(/(\d{1,2})h(\d{2})(\d{1,2})h(\d{2})/);
  if (!match) return ["00:00", "00:00"];
  const [, h1, m1, h2, m2] = match;
  return [`${h1.padStart(2, "0")}:${m1}`, `${h2.padStart(2, "0")}:${m2}`];
}

export async function scrapAndUpsertSessions(url, xpathRows) {
  console.log("Lancement du scraping sur:", url);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    console.log("Page chargée");

    const rows = await page.locator(`xpath=${xpathRows}`).elementHandles();
    console.log("Nombre de lignes trouvées:", rows.length);

    for (const row of rows.slice(1)) {
      const cells = await row.$$("td");
      if (cells.length < 5) continue;

      const texts = [];
      for (const c of cells) {
        const t = (await c.textContent())?.trim() || "";
        texts.push(t);
      }

      console.log("Ligne extraite:", texts);

      const hour = texts[0] || "00h0000h00";
      const classroom = texts[1] || "Unknown";
      const subject = texts[2] || "Unknown";
      const teacher = texts[3] || "Unknown";
      const promotion = texts[4] || "Unknown";

      const [startTime, endTime] = parseHour(hour);
      const date = new Date(); // ✅ défini ici

      console.log("Données préparées pour Prisma:", {
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
          update: { teacher, promotion },
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
        console.log("Session insérée ou mise à jour");
      } catch (err) {
        console.error("Erreur Prisma:", err.message);
      }
    }
  } catch (err) {
    console.error("Erreur scraping:", err);
  } finally {
    await browser.close();
    console.log("Navigateur fermé");
  }
}
