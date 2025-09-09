import express from "express";
import { scrapeTableWithXPath } from "../services/scraper.js";

const router = express.Router();

router.get("/", async (req, res) => {
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

export default router;
