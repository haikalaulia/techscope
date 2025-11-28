import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  PickRegister,
  PickLogin,
  JwtPayload,
  PickForgotPasswordEmail,
  PickVerify,
  PickSendOtp,
  PickResetPassword,
  PickUpdateProfile,
} from "../types/auth.types";
import { PrismaClient } from "@prisma/client";
import { generateOtp } from "../utils/otp-handler";

const prisma = new PrismaClient();
import { sendOTPEmail } from "../utils/mailer";
import { uploadCloudinary } from "../utils/uploadsClodinary";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

class AuthController {
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickRegister = req.body;

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

      const hashedPassword = await bcryptjs.hash(auth.password, 10);
      const otp = generateOtp(6);
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
      await sendOTPEmail(auth.email, otp);

      res.status(201).json({
        status: 201,
        data: newUser,
        message: "Account successfully registered",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickLogin = req.body;

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

      const validatePassword = await bcryptjs.compare(
        auth.password,
        user.password
      );
      if (!validatePassword) {
        res.status(400).json({
          status: 400,
          message: "Email & Password Not Match",
        });
        return;
      }

      const payload: JwtPayload = {
        id: user.id, // Menggunakan 'id' sesuai Prisma
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };
      if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      await prisma.user.update({ where: { id: user.id }, data: { token } });

      res.status(200).json({
        status: 200,
        data: { ...user, token },
        message: "Login successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth = req.user as JwtPayload;

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
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  public forgotPassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const auth: PickForgotPasswordEmail = req.body;
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
      const otp = generateOtp(6);
      const otpExpiress = new Date(Date.now() + 5 * 60 * 1000);
      await sendOTPEmail(auth.email, otp);

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
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  public verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickVerify = req.body;
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
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  public sendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickSendOtp = req.body;
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

      const otp = generateOtp(6);
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      const newOtp = await prisma.user.update({
        where: { id: user.id },
        data: { otp: otp, expOtp: otpExpires },
      });

      await sendOTPEmail(auth.email, otp);

      res.status(200).json({
        status: 200,
        message: "Succes Update Otp",
        data: newOtp,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const auth: PickResetPassword = req.body;
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

      const hashedPassword = await bcryptjs.hash(auth.password, 10);

      const newPassword = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      res.status(200).json({
        status: 200,
        message: "Succes Reset Password",
        data: newPassword,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as JwtPayload; // Dari middleware otentikasi

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
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  public editProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user: PickUpdateProfile = req.body;
      const jwtUser = req.user as JwtPayload;

      if (!jwtUser?.id) {
        res.status(404).json({
          status: 404,
          message: "User not authenticated or not found",
        });
        return;
      }

      // Mengasumsikan req.files (untuk Multer) digunakan di Express
      // Anda perlu menyesuaikan ini dengan middleware Multer yang Anda gunakan.
      let documentUrl: { photoUrl: string } = { photoUrl: "" };
      let photoFile = (req as any).files?.photoUrl?.[0]; // Contoh akses Multer file

      if (photoFile) {
        // Logika upload file (contoh: Multer menyimpan buffer di memory)
        const buffer = photoFile.buffer;
        const result = await uploadCloudinary(
          buffer,
          "photoUrl",
          photoFile.originalname
        );
        documentUrl.photoUrl = result.secure_url;
      } else if (
        user.photoUrl &&
        typeof user.photoUrl === "string" &&
        user.photoUrl.startsWith("data:image")
      ) {
        // Logika upload Base64 string
        const base64 = user.photoUrl;
        const buffer = Buffer.from(base64.split(",")[1], "base64");

        const result = await uploadCloudinary(buffer, "photoUrl", "image.png");
        documentUrl.photoUrl = result.secure_url;
      }

      // Hanya update kolom yang valid
      const updateData: any = {
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
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
}

export default new AuthController();
