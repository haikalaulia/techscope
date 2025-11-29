import { useQuery } from '@tanstack/react-query';

import Api from '@/services/props.service';

export function useAuthData() {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => Api.Auth.GetProfile(),
    staleTime: 1000 * 60 * 5,
  });
  return {
    profileQuery: profileQuery.data?.data ?? '',
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    refetchAll: () => {
      profileQuery.refetch();
    },
  };
}
