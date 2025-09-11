import express from "express";
import prisma from "../config/prisma.js";

const router = express.Router();

// Ajouter une musique
router.post("/", async (req, res) => {
  const { /*sessionId,*/ title, artist } = req.body;

  try {
    const music = await prisma.music.create({
      data: { /*sessionId: Number(sessionId),*/ title, artist },
    });
    res.json(music);
  } catch (err) {
    res.status(500).json({ error: "Erreur ajout musique", details: err.message });
  }
});

//Récupérer musiques d'une session
router.get("/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const musics = await prisma.music.findMany({
      where: { sessionId: Number(sessionId) },
      include: { votes: true },
    });
    res.json(musics);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération musiques", details: err.message });
  }
});

export default router;