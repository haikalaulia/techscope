import { PrismaClient } from "@prisma/client";
import { configDotenv } from "dotenv";

// Muat environment variables
configDotenv();

// Inisialisasi Prisma Client dengan proper config untuk Vercel
const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.NODE_ENV === "production"
          ? process.env.DATABASE_URL
          : process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === "production" ? [] : ["query", "error", "warn"],
});

/**
 * Mencoba menghubungkan ke database menggunakan Prisma dengan logika retry (backoff).
 * Ini sangat berguna untuk lingkungan serverless atau container yang mungkin
 * mencoba koneksi sebelum database siap sepenuhnya.
 * @param retries Jumlah percobaan koneksi maksimum (default: 5 untuk production, 10 untuk dev)
 * @param delay Jeda waktu (ms) antar percobaan (default: 2000ms untuk production, 3000ms untuk dev)
 */
export async function connectDB(
  retries = process.env.NODE_ENV === "production" ? 3 : 10,
  delay = process.env.NODE_ENV === "production" ? 2000 : 3000
): Promise<void> {
  // Verifikasi environment variable DATABASE_URL (yang digunakan oleh Prisma)
  if (!process.env.DATABASE_URL) {
    console.error(
      "❌ DATABASE_URL environment variable is not defined. Prisma requires this variable."
    );
    process.exit(1);
  }

  for (let i = 0; i < retries; i++) {
    try {
      // Mencoba koneksi
      await prisma.$connect();
      console.log("✅ Database connected successfully!");
      return;
      return; // Koneksi berhasil, keluar dari fungsi
    } catch (err) {
      console.error(`⏳ Failed to connect (attempt ${i + 1}/${retries})`);

      // Jika sudah mencapai batas retry, lempar error
      if (i === retries - 1) {
        console.error(
          "❌ Failed to connect to database after maximum retries."
        );
        throw err;
      }

      // Tunggu sebelum mencoba lagi
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// Ekspor Prisma Client untuk digunakan di controllers
export default prisma;
