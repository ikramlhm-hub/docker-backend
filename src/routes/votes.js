import express from "express";
import prisma from "../config/db.js";

const router = express.Router();

// Voter pour une musique
router.post("/", async (req, res) => {
  const { musicId, userId } = req.body;
  try {
    const vote = await prisma.vote.create({
      data: { musicId: Number(musicId), userId },
    });
    res.json(vote);
  } catch (err) {
    if (err.code === "P2002") {
      res.status(400).json({ error: "⚠️ Vous avez déjà voté pour cette musique." });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
