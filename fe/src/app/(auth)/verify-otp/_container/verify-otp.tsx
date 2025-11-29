"use client";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import Container from "@/components/ui/container";
import OTPForm from "@/core/section/auth/verify-otp/hero-section";
import { useAppSelector } from "@/hooks/dispatch/dispatch";
import { useAppNameSpase } from "@/hooks/useAppNameSpace";
import useServices from "@/hooks/mutation/props.mutation";
import { FormVerifyOtp } from "@/types/form/auth.form";

const VerifyOtpContainer = () => {
  const namespase = useAppNameSpase();
  const otp = useAppSelector((state) => state.otp);
  const [formVerifyOtp, setFormVerifyOtp] = useState<FormVerifyOtp>({
    email: otp.email ?? "",
    otp: "",
  });
  const [colldown, setColldown] = useState<number>(0);
  const verify = useServices().Auth.mutation.useVerifyOtp();
  const resend = useServices().Auth.mutation.useSendOtp();
  const handleVerfiy = () => {
    if (otp.source === "forgot-password") {
      if (!formVerifyOtp.email || !formVerifyOtp.otp) {
        namespase.alert.toast({
          title: "Peringatan",
          message: "Email & Otp Failed",
          icon: "warning",
        });
      } else {
        verify.mutate(
          {
            email: formVerifyOtp.email,
            otp: formVerifyOtp.otp,
          },
          {
            onSuccess: () => {
              namespase.router.push("/reset-password");
            },
          }
        );
      }
    } else if (otp.source === "register") {
      if (!formVerifyOtp.email || !formVerifyOtp.otp) {
        namespase.alert.toast({
          title: "Peringatan",
          message: "Email & Otp Failed",
          icon: "warning",
        });
      } else {
        verify.mutate(
          {
            email: formVerifyOtp.email,
            otp: formVerifyOtp.otp,
          },
          {
            onSuccess: () => {
              namespase.router.push("/login");
            },
          }
        );
      }
    } else {
      return null;
    }
  };
  const handleResend = () => {
    resend.mutate(
      {
        email: otp.email ?? "",
      },
      {
        onSuccess: () => {
          setColldown(300);
        },
      }
    );
  };

  useEffect(() => {
    if (colldown <= 0) return;
    const internal = setInterval(() => {
      setColldown((prev) => {
        if (prev <= 1) {
          clearInterval(internal);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(internal);
  }, [colldown]);

  return (
    <Container className=" flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Velora Inc.
        </Link>
        <OTPForm
          formVerifyOtp={formVerifyOtp}
          isPending={verify.isPending}
          setFormVerifyOtp={setFormVerifyOtp}
          onVerify={() => handleVerfiy()}
          colldown={colldown}
          onResend={() => handleResend()}
        />
      </div>
    </Container>
  );
};

export default VerifyOtpContainer;
