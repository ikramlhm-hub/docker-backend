import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend voting app is running 🚀" });
});

app.listen(PORT, () => {
  console.log(`[server]: running at http://localhost:${PORT}`);
});
