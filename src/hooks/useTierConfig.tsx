import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios, { ApiResponse } from "./use-axios";
import { toast } from "sonner";
import {
  TierConfig,
  TierLimitsConfig,
  UpdateTierLimitsDTO,
  UpdateActivationLimitsDTO,
  UpdateAllTierLimitsDTO,
  UpdateCreditsPriceDTO,
  UpdateFullConfigDTO,
  TIER,
  CreditsPriceConfig,
} from "@/types/tier-config";

export const useGetTierConfig = () => {
  const api = useAxios();
  return useQuery({
    queryKey: ["tier-config"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<TierConfig>>(
        "/admin/tier-config"
      );
      return response.data.data;
    },
  });
};

export const useInitializeTierConfig = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<
        ApiResponse<{
          tierLimits: Record<TIER, TierLimitsConfig>;
          creditsPrice: CreditsPriceConfig;
        }>
      >("/admin/tier-config/initialize");
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Configuration initialized successfully");
      queryClient.invalidateQueries({ queryKey: ["tier-config"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to initialize configuration"
      );
    },
  });
};

export const useUpdateTierLimits = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTierLimitsDTO) => {
      const response = await api.put<ApiResponse<TierLimitsConfig>>(
        "/admin/tier-config/tier-limits",
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.tier} tier limits updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["tier-config"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to update tier limits"
      );
    },
  });
};

export const useUpdateActivationLimits = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateActivationLimitsDTO) => {
      const response = await api.put<ApiResponse<TierLimitsConfig>>(
        "/admin/tier-config/activation-limits",
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.tier} activation limits updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["tier-config"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to update activation limits"
      );
    },
  });
};

export const useUpdateAllTierLimits = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAllTierLimitsDTO) => {
      const response = await api.put<
        ApiResponse<Record<TIER, TierLimitsConfig>>
      >("/admin/tier-config/all-tier-limits", data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("All tier limits updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tier-config"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to update all tier limits"
      );
    },
  });
};

export const useUpdateCreditsPrice = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCreditsPriceDTO) => {
      const response = await api.put<ApiResponse<CreditsPriceConfig>>(
        "/admin/tier-config/credits-price",
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Credit prices updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tier-config"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to update credit prices"
      );
    },
  });
};

export const useUpdateFullConfig = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateFullConfigDTO) => {
      const response = await api.put<
        ApiResponse<{
          tierLimits: Record<TIER, TierLimitsConfig>;
          creditsPrice: CreditsPriceConfig;
        }>
      >("/admin/tier-config", data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tier-config"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to update configuration"
      );
    },
  });
};

export const useResetTierConfig = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<
        ApiResponse<{
          tierLimits: Record<TIER, TierLimitsConfig>;
          creditsPrice: CreditsPriceConfig;
        }>
      >("/admin/tier-config/reset");
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Configuration reset to defaults");
      queryClient.invalidateQueries({ queryKey: ["tier-config"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(
        error.response?.data?.message || "Failed to reset configuration"
      );
    },
  });
};
