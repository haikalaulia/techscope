"use client";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import Container from "@/components/ui/container";
import ForgotPasswordForm from "@/core/section/auth/forgot-password/hero-section";
import { useAppNameSpase } from "@/hooks/useAppNameSpace";
import useServices from "@/hooks/mutation/props.mutation";
import { FormForgotPassword } from "@/types/form/auth.form";

const ForgotPasswordContainer = () => {
  const namespase = useAppNameSpase();
  const [formForgotPassword, setFormPassword] = useState<FormForgotPassword>({
    email: "",
  });
  const forgot = useServices().Auth.mutation.useForgotPassword();
  const handlerForgot = () => {
    forgot.mutate(formForgotPassword, {
      onSuccess: () => {
        namespase.router.push("/verify-otp");
      },
    });
  };
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
        <ForgotPasswordForm
          formForgotPassword={formForgotPassword}
          setFormForgotPassword={setFormPassword}
          isPending={forgot.isPending}
          onForgot={() => handlerForgot()}
        />
      </div>
    </Container>
  );
};

export default ForgotPasswordContainer;
