import { TResponse } from "@/pkg/react-query/mutation-wrapper.type";
import {
  FormForgotPassword,
  FormLogin,
  FormRegister,
  FormSendOtp,
  FormUpdateProfile,
  FormVerifyOtp,
} from "@/types/form/auth.form";
import AxiosClient from "@/utils/axios.client";

class AuthApi {
  async Login(payload: FormLogin): Promise<TResponse<any>> {
    const res = await AxiosClient.post("/api/auth/login", payload);
    return res.data;
  }
  async Register(payload: FormRegister): Promise<TResponse<any>> {
    const res = await AxiosClient.post("/api/auth/register", payload);
    return res.data;
  }
  async Logout(): Promise<TResponse<any>> {
    const res = await AxiosClient.post("/api/auth/logout");
    return res.data;
  }

  async ForgotPassword(payload: FormForgotPassword): Promise<TResponse<any>> {
    const res = await AxiosClient.post("/api/auth/forgot", payload);
    return res.data;
  }

  async SendOtp(payload: FormSendOtp): Promise<TResponse<any>> {
    const res = await AxiosClient.post("/api/auth/send-otp", payload);
    return res.data;
  }
  async Verify(payload: FormVerifyOtp): Promise<TResponse<any>> {
    const res = await AxiosClient.post("/api/auth/verify", payload);
    return res.data;
  }
  async GetProfile(): Promise<TResponse<any>> {
    const res = await AxiosClient.get("/api/auth/");
    return res.data;
  }
  async UpdateProfile(payload: FormUpdateProfile): Promise<TResponse<any>> {
    const res = await AxiosClient.put("/api/auth", payload);
    return res.data;
  }
}

export default AuthApi;
