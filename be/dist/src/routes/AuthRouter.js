"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const auth_1 = require("../middleware/auth");
class AuthRouter {
    constructor() {
        this.authRouter = express_1.default.Router();
        this.routes();
    }
    routes() {
        // 1. POST /login
        this.authRouter.post("/login", AuthController_1.default.login);
        // 2. POST /register
        this.authRouter.post("/register", AuthController_1.default.register);
        // 3. POST /verify
        this.authRouter.post("/verify", AuthController_1.default.verifyOtp);
        // 4. POST /logout
        // Middleware verifyToken() dipanggil sebelum AuthController.logout
        this.authRouter.post("/logout", auth_1.verifyToken, AuthController_1.default.logout);
        // 5. POST /forgot
        this.authRouter.post("/forgot", AuthController_1.default.forgotPassword);
        // 6. POST /send-otp
        this.authRouter.post("/send-otp", AuthController_1.default.sendOtp);
        // 7. POST /reset-password
        this.authRouter.post("/reset-password", AuthController_1.default.resetPassword);
        // 8. GET /
        // Middleware verifyToken dipanggil sebelum AuthController.getProfile
        this.authRouter.get("/", auth_1.verifyToken, AuthController_1.default.getProfile);
        // 9. PUT / (Edit Profile)
        // Multiple middleware dipanggil secara berurutan: verifyToken, formDataMiddleware, lalu controller
        // Catatan: Karena Express tidak memiliki 'parse: "none"', kita mengandalkan middleware Multer/BodyParser
        // khusus (seperti formDataMiddleware) untuk menangani file/form data.
        this.authRouter.put("/", auth_1.verifyToken, AuthController_1.default.editProfile);
    }
}
exports.default = new AuthRouter().authRouter;
