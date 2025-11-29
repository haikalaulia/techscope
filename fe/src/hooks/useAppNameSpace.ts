import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAppDispatch } from "@/hooks/dispatch/dispatch";
import { useAppSelector } from "@/hooks/dispatch/dispatch";
import { useAlert } from "@/hooks/useAlert/costum-alert";

import { useTranslate } from "./useTranslate";

export function useAppNameSpase() {
  const alert = useAlert();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslate();
  return { alert, router, dispatch, queryClient, t };
}
