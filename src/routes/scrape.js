import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Scraping route is working 🚀" });
});

export default router;
