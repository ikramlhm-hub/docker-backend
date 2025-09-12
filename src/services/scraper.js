import { chromium } from "playwright";

export async function scrapeTableWithXPath(url, xpath) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 10000 });

    const rows = await page.locator(`xpath=${xpath}`).elementHandles();
    const results = [];

    for (const row of rows) {
      const cells = await row.$$("td");
      const rowData = [];

      for (const cell of cells) {
        const text = (await cell.textContent())?.replace(/\s+/g, " ").trim() || "";
        rowData.push(text);
      }

      if (rowData.length > 0 && rowData.some(cell => cell !== "")) {
        results.push(rowData);
      }
    }

    console.log("Données scrapées:", results.slice(0, 3)); // log des 3 premières lignes
    return results;
  } catch (err) {
    console.error("Erreur scraping:", err.message);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
