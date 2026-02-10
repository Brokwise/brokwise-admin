import { useQuery } from "@tanstack/react-query";
import useAxios from "./use-axios";

export interface PendingItems {
  brokers: number;
  companies: number;
  developers: number;
  properties: number;
  enquiries: number;
  managers: number
}

export const usePendingItems = () => {
  const api = useAxios();
  const {
    data: pendingItems,
    isLoading: isLoadingPendingItems,
    error: errorPendingItems,
  } = useQuery<PendingItems>({
    queryKey: ["pendingItems"],
    queryFn: async () => (await api.get("/pendingItems")).data.data,
    refetchInterval: 30000, // Refetch every 30 seconds to keep counts updated
  });
  return { pendingItems, isLoadingPendingItems, errorPendingItems };
};
