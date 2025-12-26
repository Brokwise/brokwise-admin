import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";
import { Developer, DeveloperStatus } from "@/types/developer";
import { toast } from "sonner";

export const useDevelopers = () => {
  const api = useAxios();
  return useQuery<Developer[]>({
    queryKey: ["developers"],
    queryFn: async () => {
      const response = await api.get("/admin/developer/getAllDevelopers");
      return response.data.data;
    },
  });
};

export const useUpdateDeveloperStatus = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      developerId,
      status,
    }: {
      developerId: string;
      status: DeveloperStatus;
    }) => {
      const response = await api.put("/admin/developer/updateStatus", {
        developerId,
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developers"] });
      toast.success("Developer status updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update developer status"
      );
    },
  });
};
