import express from "express";
import prisma from "../config/prisma.js";
import { sign } from "../utils/jwt.js";
import crypto from "crypto";

const router = express.Router();

// ----------------------
// Liste des utilisateurs
// ----------------------
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// ----------------------
// Demander un token (simulate email)
// ----------------------
router.post("/request-login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });
console.log("Login link requested for:", req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  // Génère un token aléatoire
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  // Sauvegarde dans la DB
  await prisma.authToken.create({
    data: {
      token,
      expiresAt,
      user: { connect: { id: user.id } }
    }
  });

  // Dans prod => envoyer par email
  res.json({ message: "Token créé (à envoyer par e-mail)", token });
});

// ----------------------
// Login avec token
// ----------------------
router.post("/login/:token", async (req, res) => {
  const { token } = req.params;

  const record = await prisma.authToken.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!record) return res.status(400).json({ error: "Token invalide" });
  if (record.isUsed) return res.status(400).json({ error: "Token déjà utilisé" });
  if (record.expiresAt < new Date()) return res.status(400).json({ error: "Token expiré" });

  // Marquer le token comme utilisé
  await prisma.authToken.update({
    where: { id: record.id },
    data: { isUsed: true }
  });

  // Créer JWT pour frontend
  const jwt = sign({ userId: record.user.id });

  // Optionnel: mettre à jour last login
  await prisma.user.update({
    where: { id: record.user.id },
    data: { lastLogin: new Date() }
  });

  res.json({ token: jwt, user: record.user });
});

export default router;
