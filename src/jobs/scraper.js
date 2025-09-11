import cron from "node-cron";
import { scrapAndUpsertSessions } from "../services/scraping.js";

export function scheduleDailyScraper() {
  // At 08:45 every day
  cron.schedule("45 8 * * *", async () => {
    try {
      console.log("Lancement du scraper quotidien...");
      await scrapAndUpsertSessions(process.env.SCRAPER_URL, process.env.SCRAPER_XPATH_ROWS);
      console.log("Scraper terminé ✅");
    } catch (e) {
      console.error("Erreur scraper:", e);
    }
  }, { timezone: process.env.TZ || "Europe/Paris" });
}
