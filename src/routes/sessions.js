import express from "express";

const router = express.Router();

// Récupérer toutes les sessions (provisoirement vide, plus tard on branchera le scraper)
router.get("/", (req, res) => {
  res.json({ message: "Liste des sessions (scraper à brancher)" });
});

export default router;