"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("./lib/prisma");
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const logger_1 = require("./utils/logger");
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// CORS – allow frontend dev origin
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express_1.default.json());
// Request logging middleware
app.use(requestLogger_1.requestLogger);
// Static uploads serving fallback
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// Health endpoint
app.get("/health", (_req, res) => res.status(200).json({ status: "OK" }));
app.get("/", (_req, res) => {
    res.send("AlumniConnect Backend Running");
});
// Register routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/student", student_routes_1.default);
// Global error handler
app.use(errorHandler_1.errorHandler);
const PORT = Number(process.env.PORT) || 5000;
const startServer = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL missing");
        }
        await prisma_1.prisma.$connect();
        console.log("Database Connected Successfully");
        app.listen(PORT, "0.0.0.0", () => {
            logger_1.logger.info(`🚀 Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        logger_1.logger.error(`Failed to start server due to connection or configuration error: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map