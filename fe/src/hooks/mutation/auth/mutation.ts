import { useMutation } from "@tanstack/react-query";
import { deleteCookie, setCookie } from "cookies-next";

import {
  APP_REFRESH_TOKEN_COOKIE_EXPIRES_IN,
  APP_SESSION_COOKIE_KEY,
} from "@/configs/cookies.config";
import { useAppNameSpase } from "@/hooks/useAppNameSpace";
import { TResponse } from "@/pkg/react-query/mutation-wrapper.type";
import Api from "@/services/props.service";
import { logout, setCurrentUser } from "@/stores/authSlice/authSlice";
import { clearOtp, setEmail, setSource } from "@/stores/otpSlice/otpSlice";
import { userSchema } from "@/types/api";
import {
  FormForgotPassword,
  FormLogin,
  FormRegister,
  FormSendOtp,
  FormUpdateProfile,
  FormVerifyOtp,
} from "@/types/form/auth.form";

const AuthMutation = {
  useLogin() {
    const namespace = useAppNameSpase();
    return useMutation<TResponse<any>, Error, FormLogin>({
      mutationFn: (payload) => Api.Auth.Login(payload),
      onSuccess: (res) => {
        const token = res.data.token;
        setCookie(APP_SESSION_COOKIE_KEY, token, {
          maxAge: APP_REFRESH_TOKEN_COOKIE_EXPIRES_IN / 1000,
          path: "/",
        });
        const payloadUser: userSchema = {
          user: res.data,
        };
        namespace.dispatch(setCurrentUser(payloadUser));
        namespace.alert.toast({
          title: "Berhasil ",
          message: "Selamat Datang Di Velora",
          icon: "success",
        });
      },
      onError: (err) => {
        console.error(err);
        namespace.alert.toast({
          title: "Gagal",
          message: "Gagal Masuk Ke Velora",
          icon: "error",
        });
      },
    });
  },

  useRegister() {
    const namespace = useAppNameSpase();
    return useMutation<TResponse<any>, Error, FormRegister>({
      mutationFn: (payload) => Api.Auth.Register(payload),
      onSuccess: () => {
        namespace.alert.toast({
          title: "Berhasil",
          message: "Selamat Akun Ada Terdaftar",
          icon: "success",
        });
      },
      onError: (err) => {
        console.error(err);
        namespace.alert.toast({
          title: "Gagal",
          message: "Gagal Mendaftar KeVelora",
          icon: "error",
        });
      },
    });
  },

  useLogout() {
    const namespace = useAppNameSpase();
    return useMutation<TResponse<any>, Error, any>({
      mutationFn: () => Api.Auth.Logout(),
      onSuccess: () => {
        namespace.alert.toast({
          title: "Berhasil ",
          message: "Selamat Kamu Logout",
          icon: "success",
          onVoid: () => {
            namespace.queryClient.clear();
            namespace.dispatch(logout());
            deleteCookie(APP_SESSION_COOKIE_KEY);
          },
        });
      },
      onError: (err) => {
        console.error(err);
        namespace.alert.toast({
          title: "Gagal",
          message: "Sesion Gagal",
          icon: "error",
          onVoid: () => {
            deleteCookie(APP_SESSION_COOKIE_KEY);
            namespace.router.push("/login");
            namespace.dispatch(logout());
          },
        });
      },
    });
  },

  useForgotPassword() {
    const namespace = useAppNameSpase();
    return useMutation<TResponse<any>, Error, FormForgotPassword>({
      mutationFn: (payload) => Api.Auth.ForgotPassword(payload),
      onSuccess: (res, variable) => {
        namespace.alert.toast({
          title: "Berhasil",
          message: "Otp Terkirim",
          icon: "success",
          onVoid: () => {
            namespace.dispatch(setEmail(variable.email));
            namespace.dispatch(setSource("forgot-password"));
          },
        });
      },
      onError: (err) => {
        console.error(err);
        namespace.alert.toast({
          title: "Gagal",
          message: "Email Tidak Valid",
          icon: "error",
        });
      },
    });
  },
  useVerifyOtp() {
    const namespace = useAppNameSpase();
    return useMutation<TResponse<any>, Error, FormVerifyOtp>({
      mutationFn: (payload) => Api.Auth.Verify(payload),
      onSuccess: () => {
        namespace.alert.toast({
          title: "Berhasil",
          message: "Otp Terverify",
          icon: "success",
          onVoid: () => {
            namespace.dispatch(clearOtp());
          },
        });
      },
      onError: (err) => {
        console.error(err);
        namespace.alert.toast({
          title: "Gagal",
          message: "Otp Tidak Valid",
          icon: "error",
        });
      },
    });
  },
  useSendOtp() {
    const namespace = useAppNameSpase();
    return useMutation<TResponse<any>, Error, FormSendOtp>({
      mutationFn: (payload) => Api.Auth.SendOtp(payload),
      onSuccess: () => {
        namespace.alert.toast({
          title: "Berhasil",
          message: "Otp Berhasil Terkirim",
          icon: "success",
        });
      },
      onError: (err) => {
        console.error(err);
        namespace.alert.toast({
          title: "Gagal",
          message: "Gagal Mengirim Otp",
          icon: "error",
        });
      },
    });
  },
  useUpdateProfile() {
    const namespace = useAppNameSpase();
    return useMutation<TResponse<any>, Error, FormUpdateProfile>({
      mutationFn: (payload) => Api.Auth.UpdateProfile(payload),
      onSuccess: () => {
        namespace.queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === "profile",
        });
        namespace.alert.toast({
          title: "succes",
          message: "succesfully update profile",
          icon: "success",
        });
      },
      onError: (err) => {
        console.error(err);
        namespace.alert.toast({
          title: "error",
          message: "failed update profile",
          icon: "error",
        });
      },
    });
  },
};

export default AuthMutation;
