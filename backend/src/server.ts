import 'dotenv/config';
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";

import authRoutes from "./routes/auth.routes";
import { logger } from "./utils/logger";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";

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

const startServer = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL missing");
    }

    await prisma.$connect();
    console.log("Database Connected Successfully");

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server due to connection or configuration error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

startServer();