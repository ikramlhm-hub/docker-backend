import { verify } from "../utils/jwt.js";
import prisma from "../config/prisma.js";

export default async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });
  const token = header.split(" ")[1];
  const payload = verify(token);
  if (!payload?.userId) return res.status(401).json({ error: "Invalid token" });

  const user = await prisma.user.findUnique({ where: { id: payload.userId }});
  if (!user) return res.status(401).json({ error: "User not found" });
  req.user = user;
  next();
}
