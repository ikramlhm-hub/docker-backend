// src/middleware/auth.js
import prisma from "../config/prisma.js";
import { verify } from "../utils/jwt.js";

export default async function auth(req, res, next) {
  try {
    const token = req.cookies?.jwt || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) return res.status(401).json({ error: "Non authentifié" });

    const payload = verify(token);
    if (!payload?.authTokenId) return res.status(401).json({ error: "Token invalide" });

    const authToken = await prisma.authToken.findUnique({ where: { id: payload.authTokenId }});
    if (!authToken || !authToken.isUsed || authToken.expiresAt < new Date()) {
      return res.status(401).json({ error: "Token expiré ou invalide" });
    }

    req.user = await prisma.user.findUnique({ where: { id: payload.userId }});
    next();
  } catch (err) {
    res.status(401).json({ error: "Non authentifié" });
  }
}
