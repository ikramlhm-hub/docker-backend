import { chromium } from "playwright";
import prisma from "../config/prisma.js";

function parseStartHour(hourStr) {
  // ex: "09h0012h30" → "09h00"
  const match = hourStr.match(/^(\d{2})h(\d{2})/);
  if (!match) return null;
  const [_, hh, mm] = match;
  return { hh: parseInt(hh, 10), mm: parseInt(mm, 10) };
}


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
    
    console.log("Scraped row:", texts, new Date());
    const hour = texts[0] || "Unknown";
    const room = texts[1] || null;
    const matiere = texts[2] || null;
    const teacher = texts[3] || null;
    const classe = texts[4] || hour;

    const start = parseStartHour(hour);
    //if (!start || start.hh >= 13) {
    //  continue;
    //}
    const today = new Date();
today.setHours(0, 0, 0, 0);
    const saved = await prisma.session.upsert({
      where: { subject_date: { subject: classe, date: today } }, // clé composite      
      update: {
        hour, room, matiere, teacher
      },
      create: {
        subject: classe,
        hour,
        room,
        matiere,
        teacher,
        date: today
      }
    });
      console.log("sessions:", saved);

  }

  await browser.close();
}
