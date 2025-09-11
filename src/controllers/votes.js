import express from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";
import { startOfDay } from "date-fns";

const router = express.Router();

// Vote endpoint (requires auth)
router.post("/", auth, async (req, res) => {
  const { trackId } = req.body;
  const userId = req.user.id;

  if (!trackId) return res.status(400).json({ error: "trackId requis" });
  // Load track to get sessionId
  const track = await prisma.track.findUnique({ where: { id: Number(trackId) }, include: { session: true } });
  if (!track) return res.status(404).json({ error: "Track introuvable" });
  if (track.session.subject !== req.user.promotion) {
    return res.status(403).json({ error: "Vous ne pouvez pas voter pour votre propre promotion" });
  }
  const sessionId = track.sessionId;

  // Check if user already voted today for this session
  const todayStart = startOfDay(new Date());
  const existing = await prisma.vote.findFirst({
    where: {
      userId,
      sessionId,
      votedAt: { gte: todayStart }
    }
  });
  if (existing) return res.status(400).json({ error: "Vous avez déjà voté pour cette session aujourd'hui" });

  try {
    const vote = await prisma.vote.create({
      data: {
        user: { connect: { id: userId } },
        track: { connect: { id: Number(trackId) } },
        session: { connect: { id: sessionId } }
      }
    });

    res.json({ vote });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Vous avez déjà voté pour ce morceau" });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
