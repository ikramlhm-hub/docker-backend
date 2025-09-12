import { chromium } from "playwright";
import prisma from "../config/prisma.js";

export async function scrapAndUpsertSessions(url, xpathRows) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  // xpathRows exemple: "//*[@id='...']//tr"
  const rows = await page.locator(`xpath=${xpathRows}`).elementHandles();
  for (const row of rows.slice(1)) {
    // suppose columns: hour | room | matiere | classroom | classe ...
    const cells = await row.$$('td');
    if (cells.length < 5) continue;
    const texts = [];
    for (const c of cells) {
      const t = (await c.textContent())?.trim() || "";
      texts.push(t);
    }
    if (texts.slice(0, 5).some((t) => t === "")) {
      continue; // ignorer si une case est vide, y compris la 5ᵉ
    }
    console.log("Scraped row:", texts);
    const hour = texts[0] || "Unknown";
    const room = texts[1] || null;
    const matiere = texts[2] || null;
    const teacher = texts[3] || null;
    const classe = texts[4] || hour;

    await prisma.session.upsert({
      where: { subject: classe },
      update: {
        hour, room, matiere, teacher
      },
      create: {
        subject: classe,
        hour,
        room,
        matiere,
        teacher
      }
    });
  }

  await browser.close();
}