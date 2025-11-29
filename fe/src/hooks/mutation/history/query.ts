import { useQuery } from "@tanstack/react-query";

import Api from "@/services/props.service";

export function useHistoryData(userId?: string) {
  const historyQuery = useQuery({
    queryKey: ["historyAll", userId],
    queryFn: () => Api.History.HistoryAll(userId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
  const historyQueryHybrid = useQuery({
    queryKey: ["historyHybrid", userId],
    queryFn: () => Api.History.HistoryHybrid(userId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
  const historyQueryVector = useQuery({
    queryKey: ["historyVector", userId],
    queryFn: () => Api.History.HistoryVector(userId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
  const historyQueryJaccard = useQuery({
    queryKey: ["historyJaccard", userId],
    queryFn: () => Api.History.HistoryJaccard(userId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
  return {
    historyQuery: historyQuery.data?.data ?? [],
    historyQueryHybrid: historyQueryHybrid.data?.data ?? [],
    historyQueryVector: historyQueryVector.data?.data ?? [],
    historyQueryJaccard: historyQueryJaccard.data?.data ?? [],
    isLoading:
      historyQuery.isLoading ||
      historyQueryHybrid.isLoading ||
      historyQueryVector.isLoading ||
      historyQueryJaccard.isLoading,
    isError:
      historyQuery.isError ||
      historyQueryHybrid.isError ||
      historyQueryVector.isError ||
      historyQueryJaccard.isError,
    refecthAll: () => {
      historyQuery.refetch();
      historyQueryHybrid.refetch();
      historyQueryVector.refetch();
      historyQueryJaccard.refetch();
    },
  };
}
