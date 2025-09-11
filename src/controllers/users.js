import express from "express";
import prisma from "../config/prisma.js";
import { sign } from "../utils/jwt.js";

const router = express.Router();

// List users
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Simple login by email (dev): return JWT if email exists
router.post("/login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  const token = sign({ userId: user.id });
  console.log("User logged in:", user);
  res.json({ token, user });
});

export default router;
