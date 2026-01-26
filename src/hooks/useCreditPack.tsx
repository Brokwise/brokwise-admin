import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios, { ApiResponse } from "./use-axios";
import { toast } from "sonner";
import {
  ICreditPack,
  CreateCreditPackDTO,
  UpdateCreditPackDTO,
} from "@/types/credit-pack";

export const useGetCreditPacks = (includeInactive: boolean = true) => {
  const api = useAxios();
  return useQuery({
    queryKey: ["credit-packs", { includeInactive }],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ICreditPack[]>>(
        `/admin/credit-packs?includeInactive=${includeInactive}`
      );
      return response.data.data;
    },
  });
};

export const useGetCreditPackById = (packId: string) => {
  const api = useAxios();
  return useQuery({
    queryKey: ["credit-packs", packId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ICreditPack>>(
        `/admin/credit-packs/${packId}`
      );
      return response.data.data;
    },
    enabled: !!packId,
  });
};

export const useCreateCreditPack = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCreditPackDTO) => {
      const response = await api.post<ApiResponse<ICreditPack>>(
        "/admin/credit-packs",
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Credit pack created successfully");
      queryClient.invalidateQueries({ queryKey: ["credit-packs"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to create credit pack"
      );
    },
  });
};

export const useUpdateCreditPack = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      packId,
      data,
    }: {
      packId: string;
      data: UpdateCreditPackDTO;
    }) => {
      const response = await api.put<ApiResponse<ICreditPack>>(
        `/admin/credit-packs/${packId}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Credit pack updated successfully");
      queryClient.invalidateQueries({ queryKey: ["credit-packs"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to update credit pack"
      );
    },
  });
};

export const useDeleteCreditPack = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packId: string) => {
      const response = await api.delete<ApiResponse<void>>(
        `/admin/credit-packs/${packId}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Credit pack deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["credit-packs"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to delete credit pack"
      );
    },
  });
};

export const useToggleCreditPackStatus = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packId: string) => {
      const response = await api.patch<ApiResponse<ICreditPack>>(
        `/admin/credit-packs/${packId}/toggle-status`
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Credit pack ${data.isActive ? "activated" : "deactivated"} successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["credit-packs"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to toggle credit pack status"
      );
    },
  });
};

export const useSeedDefaultCreditPacks = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<ApiResponse<void>>(
        "/admin/credit-packs/seed"
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Default credit packs seeded successfully");
      queryClient.invalidateQueries({ queryKey: ["credit-packs"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to seed default credit packs"
      );
    },
  });
};
