"use client";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import Container from "@/components/ui/container";
import LoginForm from "@/core/section/auth/login/hero-section";
import useServices from "@/hooks/mutation/props.mutation";
import { useAppNameSpase } from "@/hooks/useAppNameSpace";
import { FormLogin } from "@/types/form/auth.form";

const LoginContainer = () => {
  const namespase = useAppNameSpase();
  const t = namespase.t;
  const [formLogin, setFormLogin] = useState<FormLogin>({
    email: "",
    password: "",
  });

  const login = useServices().Auth.mutation.useLogin();

  const handleLogin = () => {
    if (!formLogin.email || !formLogin.password) {
      namespase.alert.toast({
        title: "Warning",
        message: "Please fill in all fields",
        icon: "warning",
      });
      return;
    }

    login.mutate(formLogin, {
      onSuccess: () => {
        namespase.router.push("/dashboard");
      },
    });
  };

  return (
    <Container className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
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
          <LoginForm
            formLogin={formLogin}
            setFormLogin={setFormLogin}
            onLogin={handleLogin}
            isPending={login.isPending}
            t={t}
          />
        </div>
      </div>
    </Container>
  );
};

export default LoginContainer;
