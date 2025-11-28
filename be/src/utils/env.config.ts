import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  JWT_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform((val) => Number(val)),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_SECURE: z.preprocess((val) => val === "true", z.boolean()),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.log("Invalid Env Variabels:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
