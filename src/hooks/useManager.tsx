import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";
import { toast } from "sonner";
import {
  Manager,
  CreateManagerDTO,
  UpdateManagerDTO,
  UpdateManagerPermissionsDTO,
  ResetManagerPasswordDTO,
  PermissionDefinition,
  MyPermissionsResponse,
} from "@/types/manager";

// Fetch all managers
export const useManagers = (
  includeInactive: boolean = false,
  enabled: boolean = true
) => {
  const api = useAxios();
  const {
    data: managers,
    isLoading: isLoadingManagers,
    error: errorManagers,
  } = useQuery<Manager[]>({
    queryKey: ["managers", includeInactive],
    queryFn: async () => {
      const response = await api.get("/admin/manager", {
        params: { includeInactive },
      });
      return response.data.data;
    },
    enabled,
  });
  return { managers, isLoadingManagers, errorManagers };
};

// Fetch manager by ID
export const useManagerById = (managerId: string) => {
  const api = useAxios();
  const {
    data: manager,
    isLoading: isLoadingManager,
    error: errorManager,
  } = useQuery<Manager>({
    queryKey: ["manager", managerId],
    queryFn: async () => {
      const response = await api.get(`/admin/manager/${managerId}`);
      return response.data.data;
    },
    enabled: !!managerId,
  });
  return { manager, isLoadingManager, errorManager };
};

// Fetch available permissions
export const usePermissions = (enabled: boolean = true) => {
  const api = useAxios();
  const {
    data: permissions,
    isLoading: isLoadingPermissions,
    error: errorPermissions,
  } = useQuery<PermissionDefinition[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await api.get("/admin/manager/permissions");
      return response.data.data;
    },
    enabled,
  });
  return { permissions, isLoadingPermissions, errorPermissions };
};

export const useMyPermissions = (
  enabled: boolean = true,
  cacheKey: string | null = null
) => {
  const api = useAxios();
  return useQuery<MyPermissionsResponse>({
    queryKey: ["my-permissions", cacheKey],
    queryFn: async () => {
      const response = await api.get("/admin/manager/me/permissions");
      return response.data.data;
    },
    enabled,
  });
};

// Create manager mutation
export const useCreateManager = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateManagerDTO) => {
      const response = await api.post("/admin/manager", data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Manager created successfully!");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to create manager";
      toast.error(message);
    },
  });
};

// Update manager mutation
export const useUpdateManager = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateManagerDTO) => {
      const response = await api.put("/admin/manager", data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Manager updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to update manager";
      toast.error(message);
    },
  });
};

// Update manager permissions mutation
export const useUpdateManagerPermissions = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateManagerPermissionsDTO) => {
      const response = await api.put("/admin/manager/permissions", data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Permissions updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to update permissions";
      toast.error(message);
    },
  });
};

// Reset manager password mutation
export const useResetManagerPassword = () => {
  const api = useAxios();

  return useMutation({
    mutationFn: async (data: ResetManagerPasswordDTO) => {
      const response = await api.put("/admin/manager/reset-password", data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Password reset successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to reset password";
      toast.error(message);
    },
  });
};

// Deactivate manager mutation
export const useDeactivateManager = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (managerId: string) => {
      const response = await api.delete(`/admin/manager/${managerId}`);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Manager deactivated successfully!");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Failed to deactivate manager";
      toast.error(message);
    },
  });
};
