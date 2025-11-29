"use client";
import AuthMutation from "@/hooks/mutation/auth/mutation";

import { useAuthData } from "./auth/query";
import HistoryMutation from "./history/mutation";
import { useHistoryData } from "./history/query";
import useSearchingMutation from "./searching/mutation";
import { useSearchData } from "./searching/query";

export const useServices = () => ({
  Auth: {
    mutation: AuthMutation,
    query: useAuthData,
  },
  Search: {
    mutation: useSearchingMutation,
    query: useSearchData,
  },
  History: {
    mutation: HistoryMutation,
    query: useHistoryData,
  },
});

export default useServices;
