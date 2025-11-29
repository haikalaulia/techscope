import { IAuth } from "../schema";

export type FormRegister = Pick<IAuth, "email" | "password" | "fullName">;
export type FormLogin = Pick<IAuth, "email" | "password">;
export type FormForgotPassword = Pick<IAuth, "email">;
export type FormSendOtp = Pick<IAuth, "email">;
export type FormVerifyOtp = Pick<IAuth, "email" | "otp">;
export type FormUpdateProfile = Pick<IAuth, "email" | "fullName" | "photoUrl">;
