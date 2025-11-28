"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const client_1 = require("@prisma/client");
const dotenv_1 = require("dotenv");
// Muat environment variables
(0, dotenv_1.configDotenv)();
// Inisialisasi Prisma Client
const prisma = new client_1.PrismaClient();
/**
 * Mencoba menghubungkan ke database menggunakan Prisma dengan logika retry (backoff).
 * Ini sangat berguna untuk lingkungan serverless atau container yang mungkin
 * mencoba koneksi sebelum database siap sepenuhnya.
 * * @param retries Jumlah percobaan koneksi maksimum (default: 10)
 * @param delay Jeda waktu (ms) antar percobaan (default: 3000ms)
 */
async function connectDB(retries = 10, delay = 3000) {
    // Verifikasi environment variable DATABASE_URL (yang digunakan oleh Prisma)
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL environment variable is not defined. Prisma requires this variable.");
        process.exit(1);
    }
    for (let i = 0; i < retries; i++) {
        try {
            // Mencoba koneksi
            await prisma.$connect();
            console.log("✅ Database connected successfully!");
            return; // Koneksi berhasil, keluar dari fungsi
        }
        catch (err) {
            console.error(`⏳ Failed to connect (attempt ${i + 1}/${retries})`);
            // Jika sudah mencapai batas retry, lempar error
            if (i === retries - 1) {
                console.error("❌ Failed to connect to database after maximum retries.");
                throw err;
            }
            // Tunggu sebelum mencoba lagi
            await new Promise((r) => setTimeout(r, delay));
        }
    }
}
// Ekspor Prisma Client untuk digunakan di controllers
exports.default = prisma;
