import { useMutation } from "@tanstack/react-query";

import { useAppNameSpase } from "@/hooks/useAppNameSpace";
import { TResponse } from "@/pkg/react-query/mutation-wrapper.type";
import Api from "@/services/props.service";

const HistoryMutation = {
  useDeleteById() {
    const namespace = useAppNameSpase();
    return useMutation<TResponse<any>, Error, string>({
      mutationFn: (historyId) => Api.History.DeleteHistoryById(historyId),
      onSuccess: () => {
        namespace.alert.toast({
          title: "successfully",
          message: "successfully delete history by id",
          icon: "success",
        });
      },
      onError: (err) => {
        console.error(err);
        namespace.alert.toast({
          title: "failed",
          message: "failed delete history by id",
          icon: "error",
        });
      },
    });
  },
  useDeleteAll() {
    const namespace = useAppNameSpase();
    return useMutation<TResponse<any>, Error, string>({
      mutationFn: (userId) => Api.History.DeleteHistoryAll(userId),
      onSuccess: () => {
        namespace.alert.toast({
          title: "successfully",
          message: "successfully delete all history",
          icon: "success",
        });
      },
      onError: (err) => {
        console.error(err);
        namespace.alert.toast({
          title: "failed",
          message: "failed delete All history",
          icon: "error",
        });
      },
    });
  },
};

export default HistoryMutation;
