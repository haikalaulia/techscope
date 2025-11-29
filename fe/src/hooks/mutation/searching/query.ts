import { useQuery } from "@tanstack/react-query";

import Api from "@/services/props.service";

export function useSearchData(id?: string) {
  const detailQuery = useQuery({
    queryKey: ["historyAll", id],
    queryFn: () => Api.Search.getDetailById(id!),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

  return {
    detailQuery: detailQuery.data?.data ?? "",
    isLoading: detailQuery.isLoading,

    isError: detailQuery.isError,
    refecthAll: () => {
      detailQuery.refetch();
    },
  };
}
