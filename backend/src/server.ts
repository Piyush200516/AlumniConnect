import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { setupSocket } from "./socket";
import { prisma } from "./lib/prisma";
import { transporter } from "./config/mail";

import path from "path";
import authRoutes from "./routes/auth.routes";
import passport from "./config/passport";
import session from "express-session";
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
import { initializeFirebase } from "./config/firebase";
import notificationRoutes from "./routes/notification.routes";

export const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
setupSocket(httpServer);

// CORS – allow frontend dev origin
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

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
app.use("/api/notifications", notificationRoutes);

// Global error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

// Helper: print every registered Express route at startup
function printRoutes(app: express.Express) {
  const routes: string[] = [];
  app._router?.stack?.forEach((middleware: any) => {
    if (middleware.route) {
      // Direct route
      const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
      routes.push(`  ${methods} ${middleware.route.path}`);
    } else if (middleware.name === 'router' && middleware.handle?.stack) {
      // Router middleware
      const prefix = middleware.regexp?.source
        ?.replace('\\/?', '')
        ?.replace('(?=\\/|$)', '')
        ?.replace(/\\\//g, '/')
        ?.replace(/^\^/, '') || '';
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
          routes.push(`  ${methods} ${prefix}${handler.route.path}`);
        }
      });
    }
  });
  if (routes.length > 0) {
    console.log(`\n📋 Registered routes (${routes.length}):`);
    routes.forEach((r) => console.log(r));
    console.log('');
  }
}

const startServer = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL missing");
    }

    await prisma.$connect();
    console.log("Database Connected Successfully");

    // Initialize Firebase Admin SDK
    initializeFirebase();

    if (process.env.NODE_ENV !== "test") {
      try {
        await transporter.verify();
        logger.info("✅ Ethereal Email Connected Successfully");
      } catch (err) {
        logger.error(`❌ Ethereal Email connection error: ${err instanceof Error ? err.message : err}`);
      }
    }

    httpServer.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      printRoutes(app);
    });
  } catch (error) {
    logger.error(`Failed to start server due to connection or configuration error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

