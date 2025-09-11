import express from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Voter pour une musique
router.post("/", auth, async (req, res) => {
  const { musicId, userId } = req.body;

  try {
    const vote = await prisma.vote.create({
      data: {
        musicId: Number(musicId),
        userId,
      },
    });
    res.json(vote);
  } catch (err) {
    if (err.code === "P2002") {
      // Erreur Prisma: contrainte unique violée
      res.status(400).json({ error: "Vous avez déjà voté pour cette musique." });
    } else {
      res.status(500).json({ error: "Erreur lors du vote", details: err.message });
    }
  }
});

export default router;