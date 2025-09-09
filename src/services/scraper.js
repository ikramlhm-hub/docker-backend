import { chromium } from "playwright";

export async function scrapeTableWithXPath(url, xpath) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const rows = await page.locator(`xpath=${xpath}`).elementHandles();
  const results = [];

  for (const row of rows) {
    const cells = await row.$$('td');
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
