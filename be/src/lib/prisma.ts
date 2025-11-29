import { PrismaClient } from "@prisma/client";

/**
 * Singleton instance of PrismaClient
 * Prevents multiple instances and prepared statement conflicts with Supabase PgBouncer
 *
 * Usage:
 * import { prisma } from "@/lib/prisma";
 * const users = await prisma.user.findMany();
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["query", "error", "warn"],
  });

// Only cache in development to prevent hot reload issues
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
