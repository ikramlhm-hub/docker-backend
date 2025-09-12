import express from "express";
import prisma from "../config/prisma.js";
import crypto from "crypto";
import { sign } from "../utils/jwt.js";

const router = express.Router();

// Request login link (simulé, en prod envoyer par email)
router.post("/request-login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });

  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const tokenValue = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000*60*60*24*365); // 1 an

  const authToken = await prisma.authToken.create({
    data: { token: tokenValue, userId: user.id, expiresAt }
  });

  // JWT contient authTokenId
  const jwt = sign({ authTokenId: authToken.id, userId: user.id });

  // Envoie JWT dans cookie HttpOnly
  res.cookie("jwt", jwt, {
    httpOnly: true,
    maxAge: 1000*60*60*24*365,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  });

  res.json({ message: "Token créé et envoyé par cookie (en prod, email)", token: jwt });
});

// Login avec JWT existant (lecture cookie)
router.post("/login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });

  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  // Crée nouveau AuthToken
  const tokenValue = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000*60*60*24*365);

  const authToken = await prisma.authToken.create({
    data: { token: tokenValue, userId: user.id, expiresAt }
  });

  const jwt = sign({ authTokenId: authToken.id, userId: user.id });

  res.cookie("jwt", jwt, {
    httpOnly: true,
    maxAge: 1000*60*60*24*365,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  });

  res.json({ user });
});

// Logout : supprime le cookie et invalide le token
router.post("/logout", async (req, res) => {
  const token = req.cookies?.jwt;
  if (token) {
    const payload = sign.verify(token);
    if (payload?.authTokenId) {
      await prisma.authToken.update({
        where: { id: payload.authTokenId },
        data: { isUsed: true }
      });
    }
  }
  res.clearCookie("jwt");
  res.json({ message: "Déconnecté" });
});

export default router;
