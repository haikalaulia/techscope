"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_config_1 = require("./env.config");
dotenv_1.default.config();
const sendOTPEmail = async (to, otp) => {
    const transporter = nodemailer_1.default.createTransport({
        host: env_config_1.env.SMTP_HOST,
        port: env_config_1.env.SMTP_PORT,
        secure: env_config_1.env.SMTP_SECURE,
        auth: {
            user: env_config_1.env.SMTP_USER,
            pass: env_config_1.env.SMTP_PASS,
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
exports.sendOTPEmail = sendOTPEmail;
