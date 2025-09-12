import express from "express";
import prisma from "../config/db.js";

const router = express.Router();

// Ajouter une musique
router.post("/", async (req, res) => {
  const { sessionId, title, artist } = req.body;
  try {
    const music = await prisma.music.create({
      data: { sessionId: Number(sessionId), title, artist },
    });
    res.json(music);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lister les musiques d’une session avec nb de votes
router.get("/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  try {
    const musics = await prisma.music.findMany({
      where: { sessionId: Number(sessionId) },
      include: { votes: true },
    });
    const result = musics.map(m => ({
      ...m,
      votesCount: m.votes.length,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
