import { useQuery } from '@tanstack/react-query';
import { openFoodFactsApi } from '@/shared/api/openfoodfacts';

export function useOpenFoodFactsAvailable(): boolean {
  const { data } = useQuery({
    queryKey: ['openfoodfacts', 'status'],
    queryFn: async () => (await openFoodFactsApi.status()).data,
    staleTime: 10 * 60_000,
  });
  return data?.available ?? false;
}
