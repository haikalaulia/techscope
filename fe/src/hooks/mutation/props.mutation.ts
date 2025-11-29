"use client";
import AuthMutation from "@/hooks/mutation/auth/mutation";

import { useAuthData } from "./auth/query";

export const useServices = () => ({
  Auth: {
    mutation: AuthMutation,
    query: useAuthData,
  },
});

export default useServices;
