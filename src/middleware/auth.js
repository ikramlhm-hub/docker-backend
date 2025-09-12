import { verify } from "../utils/jwt.js";
import prisma from "../config/prisma.js";

export default async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Token manquant" });
  const token = header.split(" ")[1];
  try {
    const payload = verify(token); // décode JWT
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: "Utilisateur invalide" });
    req.user = user; // ajoute user à la requête
    next();
  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
}