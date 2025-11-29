"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import Container from "@/components/ui/container";
import BackgroundMemo from "@/core/components/background-memo";
import RegisterCard from "@/core/section/auth/register/hero-section";
import useServices from "@/hooks/mutation/props.mutation";
import { useAppNameSpase } from "@/hooks/useAppNameSpace";
import { setEmail, setSource } from "@/stores/otpSlice/otpSlice";
import { FormRegister } from "@/types/form/auth.form";

const RegisterContainer = () => {
  const namespase = useAppNameSpase();
  const [formRegister, setFormRegister] = useState<FormRegister>({
    email: "",
    password: "",
    fullName: "",
  });

  const register = useServices().Auth.mutation.useRegister();

  const handleRegister = () => {
    if (
      !formRegister.email ||
      !formRegister.password ||
      !formRegister.fullName
    ) {
      namespase.alert.toast({
        title: "Warning",
        message: "Please fill in all fields",
        icon: "warning",
      });
      return;
    }

    register.mutate(formRegister, {
      onSuccess: (res, variable) => {
        namespase.dispatch(setEmail(variable.email));
        namespase.dispatch(setSource("register"));
        namespase.router.push("/verify-otp");
      },
    });
  };

  return (
    <Container className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="absolute w-full h-full z-[-1]">
        <BackgroundMemo />
      </div>
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
        <div className="w-full max-w-sm">
          <RegisterCard
            formRegister={formRegister}
            setFormRegister={setFormRegister}
            onRegister={handleRegister}
            isPending={register.isPending}
            t={namespase.t}
          />
        </div>
      </div>
    </Container>
  );
};

export default RegisterContainer;
