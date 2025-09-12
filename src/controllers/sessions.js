import express from "express";
import prisma from "../config/prisma.js";
const router = express.Router();
import {startOfDay, endOfDay} from 'date-fns';
// Get all sessions
router.get("/", async (req, res) => {
  const today = new Date();
  const sessions = await prisma.session.findMany({ where  : {

    date : {
      gte: startOfDay(today),
      lte: endOfDay(today),

    },


  }, orderBy: { subject: "asc" }});
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