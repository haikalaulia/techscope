"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const otp_handler_1 = require("../utils/otp-handler");
const prisma = new client_1.PrismaClient();
const mailer_1 = require("../utils/mailer");
const uploadsClodinary_1 = require("../utils/uploadsClodinary");
class AuthController {
    constructor() {
        this.register = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email || !auth.fullName || !auth.password) {
                    res.status(400).json({ message: "All fields are required" });
                    return;
                }
                const isAlreadyRegistered = await prisma.user.findUnique({
                    where: { email: auth.email },
                });
                if (isAlreadyRegistered) {
                    res.status(400).json({ message: "Email already registered" });
                    return;
                }
                const hashedPassword = await bcryptjs_1.default.hash(auth.password, 10);
                const otp = (0, otp_handler_1.generateOtp)(6);
                const otpExpiress = new Date(Date.now() + 5 * 60 * 1000);
                const newUser = await prisma.user.create({
                    data: {
                        email: auth.email,
                        fullName: auth.fullName,
                        password: hashedPassword,
                        role: auth.role || "user",
                        otp: otp,
                        expOtp: otpExpiress,
                        isVerify: false,
                    },
                });
                newUser.expOtp = otpExpiress;
                await (0, mailer_1.sendOTPEmail)(auth.email, otp);
                res.status(201).json({
                    status: 201,
                    data: newUser,
                    message: "Account successfully registered",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
        this.login = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email || !auth.password) {
                    res.status(400).json({
                        status: 400,
                        message: "Email & Password isRequired",
                    });
                    return;
                }
                const user = await prisma.user.findUnique({
                    where: { email: auth.email },
                });
                if (!user) {
                    res.status(404).json({
                        status: 404,
                        message: "User Not Found",
                    });
                    return;
                }
                const validatePassword = await bcryptjs_1.default.compare(auth.password, user.password);
                if (!validatePassword) {
                    res.status(400).json({
                        status: 400,
                        message: "Email & Password Not Match",
                    });
                    return;
                }
                const payload = {
                    id: user.id, // Menggunakan 'id' sesuai Prisma
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                };
                if (!process.env.JWT_SECRET)
                    throw new Error("JWT_SECRET not set");
                const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: "1d",
                });
                await prisma.user.update({ where: { id: user.id }, data: { token } });
                res.status(200).json({
                    status: 200,
                    data: { ...user, token },
                    message: "Login successfully",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    status: 500,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
        this.logout = async (req, res) => {
            try {
                const auth = req.user;
                if (!auth?.id) {
                    res.status(401).json({ status: 401, message: "Unauthorized" });
                    return;
                }
                const user = await prisma.user.findUnique({
                    where: { id: auth.id },
                });
                if (!user) {
                    res.status(404).json({ status: 404, message: "Account not found" });
                    return;
                }
                await prisma.user.update({
                    where: { id: auth.id },
                    data: { token: null },
                });
                res.status(200).json({
                    status: 200,
                    message: "Account logged out successfully",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    status: 500,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
        this.forgotPassword = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email) {
                    res.status(400).json({
                        status: 400,
                        message: "Email Required",
                    });
                    return;
                }
                const user = await prisma.user.findFirst({
                    where: { email: auth.email },
                });
                if (!user) {
                    res.status(404).json({
                        status: 404,
                        message: "Email Not Found",
                    });
                    return;
                }
                const otp = (0, otp_handler_1.generateOtp)(6);
                const otpExpiress = new Date(Date.now() + 5 * 60 * 1000);
                await (0, mailer_1.sendOTPEmail)(auth.email, otp);
                const newOtp = await prisma.user.update({
                    where: {
                        email: auth.email,
                    },
                    data: {
                        otp: otp,
                        expOtp: otpExpiress,
                    },
                });
                res.status(200).json({
                    status: 200,
                    data: newOtp,
                    message: "Succes Get Email",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
        this.verifyOtp = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email || !auth.otp) {
                    res.status(400).json({
                        status: 400,
                        message: "Email & Otp requaired",
                    });
                    return;
                }
                const user = await prisma.user.findFirst({
                    where: {
                        email: auth.email,
                        otp: auth.otp,
                    },
                });
                if (!user) {
                    res.status(404).json({
                        status: 404,
                        message: "Email or OTP Not Found / OTP Failed",
                    });
                    return;
                }
                // TODO: Tambahkan cek expOtp di sini
                const updateUser = await prisma.user.update({
                    where: { id: user.id },
                    data: { isVerify: true, otp: null },
                });
                res.status(200).json({
                    status: 200,
                    message: "Otp isVerify",
                    data: updateUser,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
        this.sendOtp = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email) {
                    res.status(400).json({
                        status: 400,
                        message: "Email is required",
                    });
                    return;
                }
                // findFirstOrThrow diganti findFirst lalu cek manual
                const user = await prisma.user.findFirst({
                    where: {
                        email: auth.email,
                    },
                });
                if (!user) {
                    res.status(404).json({
                        status: 404,
                        message: "Account Not Found",
                    });
                    return;
                }
                const otp = (0, otp_handler_1.generateOtp)(6);
                const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
                const newOtp = await prisma.user.update({
                    where: { id: user.id },
                    data: { otp: otp, expOtp: otpExpires },
                });
                await (0, mailer_1.sendOTPEmail)(auth.email, otp);
                res.status(200).json({
                    status: 200,
                    message: "Succes Update Otp",
                    data: newOtp,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
        this.getProfile = async (req, res) => {
            try {
                const user = req.user; // Dari middleware otentikasi
                if (!user?.id) {
                    res.status(404).json({
                        status: 404,
                        message: "User not found",
                    });
                    return;
                }
                const auth = await prisma.user.findFirst({
                    where: {
                        id: user.id,
                    },
                });
                if (!auth) {
                    res.status(404).json({
                        status: 404,
                        message: "Account not found in database",
                    });
                    return;
                }
                res.status(200).json({
                    status: 200,
                    message: "succes get user",
                    data: auth,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
        this.editProfile = async (req, res) => {
            try {
                const user = req.body;
                const jwtUser = req.user;
                if (!jwtUser?.id) {
                    res.status(404).json({
                        status: 404,
                        message: "User not authenticated or not found",
                    });
                    return;
                }
                // Mengasumsikan req.files (untuk Multer) digunakan di Express
                // Anda perlu menyesuaikan ini dengan middleware Multer yang Anda gunakan.
                let documentUrl = { photoUrl: "" };
                let photoFile = req.files?.photoUrl?.[0]; // Contoh akses Multer file
                if (photoFile) {
                    // Logika upload file (contoh: Multer menyimpan buffer di memory)
                    const buffer = photoFile.buffer;
                    const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, "photoUrl", photoFile.originalname);
                    documentUrl.photoUrl = result.secure_url;
                }
                else if (user.photoUrl &&
                    typeof user.photoUrl === "string" &&
                    user.photoUrl.startsWith("data:image")) {
                    // Logika upload Base64 string
                    const base64 = user.photoUrl;
                    const buffer = Buffer.from(base64.split(",")[1], "base64");
                    const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, "photoUrl", "image.png");
                    documentUrl.photoUrl = result.secure_url;
                }
                // Hanya update kolom yang valid
                const updateData = {
                    fullName: user.fullName,
                    email: user.email,
                };
                if (documentUrl.photoUrl) {
                    updateData.photoUrl = documentUrl.photoUrl;
                }
                const Auth = await prisma.user.update({
                    where: {
                        id: jwtUser.id,
                    },
                    data: updateData,
                });
                res.status(201).json({
                    status: 201,
                    message: "Succes update profile",
                    data: Auth,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
    }
    async resetPassword(req, res) {
        try {
            const auth = req.body;
            if (!auth.email || !auth.password) {
                res.status(404).json({
                    status: 404,
                    message: "Email & NewPassword required ",
                });
                return;
            }
            const user = await prisma.user.findFirst({
                where: {
                    email: auth.email,
                },
            });
            if (!user) {
                res.status(404).json({
                    status: 404,
                    message: "Email Not Found",
                });
                return;
            }
            if (!user.isVerify) {
                res.status(400).json({
                    status: 400,
                    message: "Account not verify",
                });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(auth.password, 10);
            const newPassword = await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
            res.status(200).json({
                status: 200,
                message: "Succes Reset Password",
                data: newPassword,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                status: 500,
                message: "Server Internal Error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
}
exports.default = new AuthController();
