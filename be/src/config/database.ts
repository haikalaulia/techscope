import { configDotenv } from "dotenv";
import { prisma } from "../lib/prisma";

configDotenv();

export async function connectDB(
  retries = process.env.NODE_ENV === "production" ? 3 : 10,
  delay = process.env.NODE_ENV === "production" ? 2000 : 3000
) {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not defined.");
    process.exit(1);
  }

  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("✅ Database connected successfully!");
      return;
    } catch (err) {
      console.log(`⏳ Retry ${i + 1}/${retries} failed...`);

      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
