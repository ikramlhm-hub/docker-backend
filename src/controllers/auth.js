import express from "express";
import prisma from "../config/prisma.js";
import { sign } from "../utils/jwt.js";
import crypto from "crypto";

const router = express.Router();

import { verify } from "../utils/jwt.js";

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.jwt || req.headers?.authorization?.split(" ")[1];
    if (!token) return res.status(200).json({ user: null });

    const payload = verify(token);
    if (!payload?.authTokenId) return res.status(200).json({ user: null });

    const authToken = await prisma.authToken.findUnique({ where: { id: payload.authTokenId }});
    if (!authToken || authToken.isUsed || authToken.expiresAt < new Date()) {
      return res.status(200).json({ user: null });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId }});
    return res.json({ user });
  } catch (err) {
    return res.status(200).json({ user: null });
  }
});


// Request login link (we create auth token, in prod send by email)
router.post("/request-login", async (req, res) => {
  console.log("Login link requested for:", req.body);
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // 1 an

  await prisma.authToken.create({
    data: {
      token,
      expiresAt,
      user: { connect: { id: user.id } }
    }
  });

  // Ici on devrait envoyer un email. Pour dev on renvoie le token dans la réponse.
  res.json({ message: "Token créé (à envoyer par e-mail dans prod)", token });
});

// Login with token (the token we created)
router.post("/login/:token", async (req, res) => {
  const { token } = req.params;
  const record = await prisma.authToken.findUnique({ where: { token }, include: { user: true }});
  if (!record) return res.status(400).json({ error: "Token invalide" });
  if (record.isUsed) return res.status(400).json({ error: "Token déjà utilisé" });
  if (record.expiresAt < new Date()) return res.status(400).json({ error: "Token expiré" });

  // Mark used
  await prisma.authToken.update({ where: { id: record.id }, data: { isUsed: true }});

  // Create JWT that includes authTokenId
  const jwt = sign({ authTokenId: record.id, userId: record.user.id });

  // Set cookie HttpOnly (sent to browser)
  res.cookie("jwt", jwt, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 an
    sameSite: "lax", // pour dev ok ; si cross-site strict -> sameSite:'none' + secure:true 
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  // Return user (no need to return jwt because we use cookie)
  res.json({ user: record.user });
});

export default router;
