import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxios from "./use-axios";
import { Property, PropertyDeleteRequest } from "@/types/properties";

export const useProperty = () => {
  const api = useAxios();
  const {
    data: properties,
    isLoading: isLoadingProperties,
    error: errorProperties,
  } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: async () => {
      const response = await api.get("/admin/properties/all");
      return response.data?.data.properties;
    },
  });
  return { properties, isLoadingProperties, errorProperties };
};

export type PaginatedPropertiesResult = {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
};

export const usePaginatedProperties = (params?: {
  page?: number;
  limit?: number;
}) => {
  const api = useAxios();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  const {
    data,
    isLoading: isLoadingProperties,
    error: errorProperties,
  } = useQuery<PaginatedPropertiesResult>({
    queryKey: ["properties", "paginated", page, limit],
    queryFn: async () => {
      const response = await api.get("/admin/properties/all", {
        params: { page, limit },
      });

      const raw = response.data?.data;
      const properties = (raw?.properties ?? []) as Property[];
      const total = Number(raw?.total ?? properties.length ?? 0);
      const totalPages = Number(
        raw?.totalPages ?? Math.max(1, Math.ceil(total / limit))
      );
      const currentPage = Number(raw?.page ?? page);

      return { properties, total, page: currentPage, totalPages };
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  return {
    propertiesPage: data,
    isLoadingProperties,
    errorProperties,
  };
};

export const useUpdatePropertyStatus = () => {
  const api = useAxios();
  const { mutate, isPending, error } = useMutation({
    mutationKey: ["updatePropertyStatus"],
    mutationFn: async (data: {
      propertyId: string;
      status: string;
      reason?: string;
    }) => {
      const response = await api.put(`/admin/properties/updateStatus`, {
        propertyId: data.propertyId,
        listingStatus: data.status,
        reason: data.reason,
      });
      return response.data?.data;
    },
  });
  return { mutate, isPending, error };
};

export const useDeleteRequests = () => {
  const api = useAxios();
  const {
    data: deleteRequests,
    isLoading: isLoadingDeleteRequests,
    error: errorDeleteRequests,
  } = useQuery<PropertyDeleteRequest[]>({
    queryKey: ["deleteRequests"],
    queryFn: async () => {
      const response = await api.get("/admin/deleteRequests");
      return response.data?.data;
    },
  });
  return { deleteRequests, isLoadingDeleteRequests, errorDeleteRequests };
};

export const useManageDeleteRequest = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationKey: ["manageDeleteRequest"],
    mutationFn: async (data: {
      requestId: string;
      status: "approved" | "rejected";
    }) => {
      const response = await api.delete("/admin/deletePropertyRequest", {
        data: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleteRequests"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
  return { mutate, isPending, error };
};
