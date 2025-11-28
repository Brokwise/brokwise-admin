import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
