import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { env } from "./env.config";

dotenv.config();

export const sendOTPEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  const info = await transporter.sendMail({
    from: `"Synch Hub" <${process.env.SMTP_USER}>`,
    to,
    subject: "Kode OTP Verifikasi Akun Anda",
    text: `Kode OTP kamu adalah: ${otp}`,
    html: `<p>Kode OTP kamu adalah: <b>${otp}</b></p><p>Jangan berikan kode ini ke siapa pun.</p>`,
  });
  console.log("✅ OTP terkirim:", info.messageId);
};
