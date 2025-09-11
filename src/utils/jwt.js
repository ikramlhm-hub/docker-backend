import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "change_me";

export function sign(payload, expiresIn = "365d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verify(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}
