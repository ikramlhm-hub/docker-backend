import express from "express";
import cors from "cors";
import scrapeRouter from "./routes/scrape.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Pour __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Servir le frontend depuis /public
app.use(express.static(path.join(__dirname, "../public")));

// Routes API
app.use("/scrape", scrapeRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`[server]: running at http://localhost:${PORT}`);
});
