import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { setupSocket } from "./socket";
import { prisma } from "./lib/prisma";

import path from "path";
import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import applicationRoutes from "./routes/application.routes";
import eventRoutes from "./routes/event.routes";
import jobRoutes from "./routes/job.routes";
import alumniRoutes from "./routes/alumni.routes";
import cdcRoutes from "./routes/cdc.routes";
import mentorshipRoutes from "./routes/mentorship.routes";
import messageRoutes from "./routes/message.routes";
import fileRoutes from "./routes/file.routes";
import { logger } from "./utils/logger";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
setupSocket(httpServer);

// CORS – allow frontend dev origin
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

// Static uploads serving fallback
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health endpoint
app.get("/health", (_req, res) => res.status(200).json({ status: "OK" }));

app.get("/", (_req, res) => {
  res.send("AlumniConnect Backend Running");
});

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/cdc", cdcRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/files", fileRoutes);

// Global error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5001;

const startServer = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL missing");
    }

    await prisma.$connect();
    console.log("Database Connected Successfully");

    httpServer.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server due to connection or configuration error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

startServer();
