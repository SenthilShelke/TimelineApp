import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";
import { authRouter } from "./auth/routes.js";
import { timelinesRouter } from "./timelines/routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check: also verifies DB connectivity.
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "unreachable" });
  }
});

app.use("/auth", authRouter);
app.use("/timelines", timelinesRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
