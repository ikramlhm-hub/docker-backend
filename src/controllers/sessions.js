import express from "express";
import prisma from "../config/prisma.js";
const router = express.Router();

// Get all sessions
router.get("/", async (req, res) => {
  const sessions = await prisma.session.findMany({ orderBy: { subject: "asc" }});
  res.json(sessions);
});

// Get single session
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const session = await prisma.session.findUnique({ where: { id }});
  if (!session) return res.status(404).json({ error: "Session introuvable" });
  res.json(session);
});

export default router;