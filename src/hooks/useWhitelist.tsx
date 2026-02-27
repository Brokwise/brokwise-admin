import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";
import { toast } from "sonner";
import { WhitelistEntry } from "@/types/whitelist";

export const useWhitelist = () => {
  const api = useAxios();
  const {
    data: whitelist,
    isLoading: isLoadingWhitelist,
    error: errorWhitelist,
  } = useQuery<WhitelistEntry[]>({
    queryKey: ["whitelist"],
    queryFn: async () => {
      const response = await api.get("/admin/whitelist");
      return response.data.data;
    },
  });
  return { whitelist, isLoadingWhitelist, errorWhitelist };
};

export const useAddWhitelist = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const {
    mutate: addWhitelist,
    isPending: isAdding,
    error: addError,
  } = useMutation({
    mutationFn: async (email: string) => {
      return await api.post("/admin/whitelist", { email });
    },
    onSuccess: () => {
      toast.success("Email added to whitelist");
      queryClient.invalidateQueries({ queryKey: ["whitelist"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to add email";
      toast.error(message);
    },
  });

  return { addWhitelist, isAdding, addError };
};

export const useRemoveWhitelist = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const {
    mutate: removeWhitelist,
    isPending: isRemoving,
    error: removeError,
  } = useMutation({
    mutationFn: async (email: string) => {
      return await api.delete("/admin/whitelist", { data: { email } });
    },
    onSuccess: () => {
      toast.success("Email removed from whitelist");
      queryClient.invalidateQueries({ queryKey: ["whitelist"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to remove email";
      toast.error(message);
    },
  });

  return { removeWhitelist, isRemoving, removeError };
};
