import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import { logger } from "./utils/logger";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

// CORS – allow frontend dev origin
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

// Health endpoint
app.get("/health", (_req, res) => res.status(200).json({ status: "OK" }));

app.get("/", (_req, res) => {
  res.send("AlumniConnect Backend Running");
});

// Register auth routes
app.use("/api/auth", authRoutes);

// Global error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});