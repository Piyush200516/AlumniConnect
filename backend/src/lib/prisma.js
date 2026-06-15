"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
// Global singleton to avoid multiple instances in hot-reloading environments
const globalForPrisma = globalThis;
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        adapter: new adapter_pg_1.PrismaPg(pool),
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map