import express from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Create a track (requires auth)
router.post("/", auth, async (req, res) => {
  const { sessionId, title, artist } = req.body;
  console.log({ sessionId, title, artist, user: req.user });
  if (!sessionId || !title || !artist) return res.status(400).json({ error: "Données incomplètes" });
   const session = await prisma.session.findUnique({ where: { id: Number(sessionId) } });
  if (!session) return res.status(404).json({ error: "Session introuvable" });

  // Vérification promotion
  if (session.subject !== req.user.promotion) {
    return res.status(403).json({ error: "Vous ne pouvez pas publier sur une autre promotion" });
  }
  try {
    const track = await prisma.track.create({
      data: {
        title,
        artist,
        session: { connect: { id: Number(sessionId) } },
        submittedBy: { connect: { id: req.user.id } }
      },
      include: { votes: true }
    });
    res.json(track);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tracks for a session with vote counts
router.get("/session/:sessionId", async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const tracks = await prisma.track.findMany({
    where: { sessionId },
    include: { votes: true, submittedBy: true },
  });

  // augment with votes count
  const enriched = tracks.map(t => ({
    ...t,
    votesCount: t.votes.length
  }));

  res.json(enriched);
});

// top tracks
router.get("/top", async (req, res) => {
  const tracks = await prisma.track.findMany({
    include: { votes: true, submittedBy: true }
  });
  const sorted = tracks
    .map(t => ({ ...t, votesCount: t.votes.length }))
    .sort((a, b) => b.votesCount - a.votesCount);
  res.json(sorted);
});

export default router;
