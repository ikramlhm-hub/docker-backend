import express from "express";
import cors from "cors";

import sessionsRoutes from "./routes/sessions.js";
import musicsRoutes from "./routes/musics.js";
import votesRoutes from "./routes/votes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//Routes
app.use("/sessions", sessionsRoutes);
app.use("/musics", musicsRoutes);
app.use("/votes", votesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend voting app is running 🚀" });
});

app.listen(PORT, () => {
  console.log(`[server]: running at http://localhost:${PORT}`);
});
