"use client";
import Container from "@/components/ui/container";
import ResetPasswordSection from "@/core/section/auth/reset-password/hero-secton";

const ResetPasswordContainer = () => {
  return (
    <Container className="w-full min-h-screen flex flex-col">
      <ResetPasswordSection />
    </Container>
  );
};

export default ResetPasswordContainer;
