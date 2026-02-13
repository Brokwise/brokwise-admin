import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import useAxios, { ApiResponse } from "./use-axios";

export type ResourceSection = "resource" | "tool";
export type ResourceScope = "common" | "state";
export type ResourceTargetType = "internal" | "external";
export type ResourceOpenMode = "webview" | "new_tab";
export type ResourceStatus = "draft" | "published" | "archived";

export interface ResourceState {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceItem {
  _id: string;
  itemGroupId: string;
  key: string;
  label: string;
  section: ResourceSection;
  scope: ResourceScope;
  stateCode?: string;
  targetType: ResourceTargetType;
  target: string;
  openMode: ResourceOpenMode;
  icon?: string;
  description?: string;
  isActive: boolean;
  status: ResourceStatus;
  sortOrder: number;
  version: number;
  isLatest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCatalog {
  states: ResourceState[];
  selectedState?: string;
  tools: ResourceItem[];
  commonResources: ResourceItem[];
  stateResources: ResourceItem[];
}

export interface CreateResourceStateDTO {
  code: string;
  name: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateResourceStateDTO {
  name?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateResourceItemDTO {
  key: string;
  label: string;
  section: ResourceSection;
  scope: ResourceScope;
  stateCode?: string;
  targetType: ResourceTargetType;
  target: string;
  openMode?: ResourceOpenMode;
  icon?: string;
  description?: string;
  isActive?: boolean;
  status?: ResourceStatus;
  sortOrder?: number;
}

export interface UpdateResourceItemDTO {
  key?: string;
  label?: string;
  section?: ResourceSection;
  scope?: ResourceScope;
  stateCode?: string | null;
  targetType?: ResourceTargetType;
  target?: string;
  openMode?: ResourceOpenMode;
  icon?: string;
  description?: string;
  isActive?: boolean;
  status?: ResourceStatus;
  sortOrder?: number;
}

const RESOURCE_QUERY_KEY = ["resources-cms"] as const;

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || fallback;
};

export const useResourceStates = (activeOnly: boolean = false) => {
  const api = useAxios();

  return useQuery({
    queryKey: [...RESOURCE_QUERY_KEY, "states", activeOnly],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ResourceState[]>>(
        `/admin/resources/states?activeOnly=${activeOnly}`
      );
      return response.data.data;
    },
  });
};

export const useResourceItems = (filters?: {
  section?: ResourceSection;
  scope?: ResourceScope;
  stateCode?: string;
  status?: ResourceStatus;
  isActive?: boolean;
  includeHistory?: boolean;
  search?: string;
}) => {
  const api = useAxios();

  return useQuery({
    queryKey: [...RESOURCE_QUERY_KEY, "items", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.section) params.set("section", filters.section);
      if (filters?.scope) params.set("scope", filters.scope);
      if (filters?.stateCode) params.set("stateCode", filters.stateCode);
      if (filters?.status) params.set("status", filters.status);
      if (filters?.isActive !== undefined) params.set("isActive", String(filters.isActive));
      if (filters?.includeHistory) params.set("includeHistory", "true");
      if (filters?.search) params.set("search", filters.search);

      const query = params.toString();
      const response = await api.get<ApiResponse<ResourceItem[]>>(
        `/admin/resources/items${query ? `?${query}` : ""}`
      );
      return response.data.data;
    },
  });
};

export const useBrokerResourceCatalogPreview = (stateCode?: string) => {
  const api = useAxios();

  return useQuery({
    queryKey: [...RESOURCE_QUERY_KEY, "catalog-preview", stateCode],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ResourceCatalog>>(
        `/admin/resources/catalog-preview${stateCode ? `?state=${stateCode}` : ""}`
      );
      return response.data.data;
    },
  });
};

export const useCreateResourceState = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateResourceStateDTO) => {
      const response = await api.post<ApiResponse<ResourceState>>(
        "/admin/resources/states",
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("State created");
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create state"));
    },
  });
};

export const useUpdateResourceState = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateResourceStateDTO }) => {
      const response = await api.put<ApiResponse<ResourceState>>(
        `/admin/resources/states/${id}`,
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("State updated");
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update state"));
    },
  });
};

export const useDeleteResourceState = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse<ResourceState>>(
        `/admin/resources/states/${id}`
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("State deactivated");
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete state"));
    },
  });
};

export const useCreateResourceItem = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateResourceItemDTO) => {
      const response = await api.post<ApiResponse<ResourceItem>>(
        "/admin/resources/items",
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Item created");
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create item"));
    },
  });
};

export const useUpdateResourceItem = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateResourceItemDTO }) => {
      const response = await api.put<ApiResponse<ResourceItem>>(
        `/admin/resources/items/${id}`,
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Item updated");
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update item"));
    },
  });
};

export const usePatchResourceItemStatus = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, isActive }: { id: string; status: ResourceStatus; isActive?: boolean }) => {
      const response = await api.patch<ApiResponse<ResourceItem>>(
        `/admin/resources/items/${id}/status`,
        { status, isActive }
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Item status updated");
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update item status"));
    },
  });
};

export const useDeleteResourceItem = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse<ResourceItem>>(
        `/admin/resources/items/${id}`
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Item archived");
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to archive item"));
    },
  });
};

export const useReorderResourceItems = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orders: Array<{ id: string; sortOrder: number }>) => {
      const response = await api.post<ApiResponse<{ updated: number }>>(
        "/admin/resources/items/reorder",
        { orders }
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Sort order updated");
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reorder items"));
    },
  });
};

export const useSeedDefaultResources = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<ApiResponse<{ createdCount: number }>>(
        "/admin/resources/seed-default"
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      toast.success(`Seed complete. Added ${data.createdCount} new entries`);
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to seed default resources"));
    },
  });
};
