import { useMutation, useQuery } from "@tanstack/react-query";
import useAxios from "./use-axios";
import { Property } from "@/types/properties";

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
