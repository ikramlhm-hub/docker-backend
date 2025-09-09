// src/index.js
import express from "express";
import cors from "cors";
import { chromium } from "playwright";

import sessionsRoutes from "./routes/sessions.js";
import musicsRoutes from "./routes/musics.js";
import votesRoutes from "./routes/votes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Fonction de scraping avec XPath via Playwright ---
async function scrapeTableWithXPath(url, xpath) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  // Sélection des lignes du tableau via XPath
  const rows = await page.locator(`xpath=${xpath}`).elementHandles();
  const results = [];

  for (const row of rows) {
    // Récupérer toutes les cellules <td>
    const cells = await row.$$("td");
    const rowData = [];
    for (const cell of cells) {
      const text = await cell.textContent();
      rowData.push(text?.trim() || "");
    }
    if (rowData.length > 0) results.push(rowData);
  }

  await browser.close();
  return results;
}

// --- Routes principales ---
app.use("/sessions", sessionsRoutes);
app.use("/musics", musicsRoutes);
app.use("/votes", votesRoutes);

// Route test
app.get("/", (req, res) => {
  res.json({ message: "Backend voting app is running 🚀" });
});

// Route pour récupérer le tableau Hyperplanning
app.get("/scrape", async (req, res) => {
  try {
    const url = "https://paris-02-2.hyperplanning.fr/hp/panneauinformations.html?id=PA3";
    const xpath = "//*[@id='interfacePanneauInformations_objetPanneauInformation_donnees']//tr";

    const table = await scrapeTableWithXPath(url, xpath);
    res.json({ data: table });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[server]: running at http://localhost:${PORT}`);
});
