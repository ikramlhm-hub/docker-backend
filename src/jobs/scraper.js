import cron from "node-cron";
import { scrapAndUpsertSessions } from "../services/scraping.js";

const url = "https://paris-02-2.hyperplanning.fr/hp/panneauinformations.html?id=PA3";
const xpath = "//*[@id='interfacePanneauInformations_objetPanneauInformation_donnees']//tr";

export function scheduleDailyScraper() {
  // At 08:45 every day
  cron.schedule("45 8 * * *", async () => {
    try {
      console.log("Lancement du scraper quotidien...");
      await scrapAndUpsertSessions(url, xpath);
      console.log("Scraper terminé ✅");
    } catch (e) {
      console.error("Erreur scraper:", e);
    }
  }, { timezone: process.env.TZ || "Europe/Paris" });
}