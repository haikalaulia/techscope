import express from "express";
import AuthController from "../controllers/AuthController";
import { verifyToken } from "../middleware/auth";

class AuthRouter {
  public authRouter;
  constructor() {
    this.authRouter = express.Router();
    this.routes();
  }

  private routes() {
    // 1. POST /login
    this.authRouter.post("/login", AuthController.login);

    // 2. POST /register
    this.authRouter.post("/register", AuthController.register);

    // 3. POST /verify
    this.authRouter.post("/verify", AuthController.verifyOtp);

    // 4. POST /logout
    // Middleware verifyToken() dipanggil sebelum AuthController.logout
    this.authRouter.post("/logout", verifyToken, AuthController.logout);

    // 5. POST /forgot
    this.authRouter.post("/forgot", AuthController.forgotPassword);

    // 6. POST /send-otp
    this.authRouter.post("/send-otp", AuthController.sendOtp);

    // 7. POST /reset-password
    this.authRouter.post("/reset-password", AuthController.resetPassword);

    // 8. GET /
    // Middleware verifyToken dipanggil sebelum AuthController.getProfile
    this.authRouter.get("/", verifyToken, AuthController.getProfile);

    // 9. PUT / (Edit Profile)
    // Multiple middleware dipanggil secara berurutan: verifyToken, formDataMiddleware, lalu controller
    // Catatan: Karena Express tidak memiliki 'parse: "none"', kita mengandalkan middleware Multer/BodyParser
    // khusus (seperti formDataMiddleware) untuk menangani file/form data.
    this.authRouter.put("/", verifyToken, AuthController.editProfile);
  }
}

export default new AuthRouter().authRouter;
