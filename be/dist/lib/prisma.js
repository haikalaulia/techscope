"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
/**
 * Singleton instance of PrismaClient
 * Prevents multiple instances and prepared statement conflicts with Supabase PgBouncer
 *
 * Usage:
 * import { prisma } from "@/lib/prisma";
 * const users = await prisma.user.findMany();
 */
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === "production"
            ? ["error"]
            : ["query", "error", "warn"],
    });
// Only cache in development to prevent hot reload issues
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
exports.default = exports.prisma;
