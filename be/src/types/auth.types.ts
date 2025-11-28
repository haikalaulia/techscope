export interface Auth {
  id: string;
  email: string;
  fullName: string;
  password: string;
  token?: string;
  role: string;
  photoUrl: string;
  createdAt: Date;
  updatedAt: Date;
  otp?: string;
  expOtp?: Date;
  isVerify?: boolean;
}

export type JwtPayload = Pick<
  Auth,
  "id" | "email" | "role" | "fullName" | "token"
>;
export type PickRegister = Pick<
  Auth,
  "email" | "fullName" | "password" | "role"
>;
export type PickLogin = Pick<Auth, "email" | "password">;
export type PickID = Pick<Auth, "id">;
export type PickForgotPasswordEmail = Pick<Auth, "email">;
export type PickVerify = Pick<Auth, "email" | "otp">;
export type PickSendOtp = Pick<Auth, "email">;
export type PickResetPassword = Pick<Auth, "email" | "password">;
export type PickUpdateProfile = Pick<Auth, "email" | "fullName" | "photoUrl">;
